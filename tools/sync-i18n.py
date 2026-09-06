#!/usr/bin/env python3
"""Keep assets/i18n/*.js in step with the English in the HTML.

Every translatable element carries data-i18n="key", and its English text is the
markup itself. Each language file holds one line per key, seeded with English so
translators can overwrite in place. When the English is edited, those files still
hold the OLD English and readers in that language see the old wording.

    python3 tools/sync-i18n.py           # report what is out of step
    python3 tools/sync-i18n.py --fix     # refresh lines nobody has translated

`assets/i18n/.english.json` records the English this tool last wrote. A line that
still matches that snapshot is untranslated, so it is safe to refresh. A line that
differs has been translated by a person: it is only ever reported, never
overwritten, so no translator's work is lost.
"""
import argparse, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
I18N = ROOT / "assets" / "i18n"
SNAPSHOT = I18N / ".english.json"
LANGS = ("ko", "es", "tr")


def english_from_html():
    """key -> current English inner HTML, normalised to one line."""
    out = {}
    for f in sorted(ROOT.glob("*.html")):
        s = f.read_text()
        for m in re.finditer(r'<(\w+)[^>]*data-i18n="([^"]+)"[^>]*>(.*?)</\1>', s, re.S):
            out[m.group(2)] = re.sub(r"\s+", " ", m.group(3)).strip()
    return out


def lang_entries(path):
    lines = path.read_text().split("\n")
    out = {}
    for i, line in enumerate(lines):
        m = re.match(r'^  "([^"]+)": (".*"),$', line)
        if m:
            out[m.group(1)] = (json.loads(m.group(2)), i)
    return lines, out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fix", action="store_true",
                    help="refresh lines that are still the English this tool last wrote")
    args = ap.parse_args()

    english = english_from_html()
    snapshot = json.loads(SNAPSHOT.read_text()) if SNAPSHOT.exists() else {}
    problems = 0

    for lang in LANGS:
        path = I18N / ("%s.js" % lang)
        lines, entries = lang_entries(path)

        missing = sorted(set(english) - set(entries))
        orphan = sorted(k for k in set(entries) - set(english) if not k.startswith("ui."))
        stale, human = [], []

        for key, (value, idx) in entries.items():
            if key not in english or value == english[key]:
                continue
            if key in snapshot and value != snapshot[key]:
                human.append(key)          # a person wrote this — leave it alone
            else:
                stale.append((key, idx))

        print("%s: %d keys | missing %d | orphaned %d | stale English %d | needs a translator %d"
              % (lang, len(entries), len(missing), len(orphan), len(stale), len(human)))
        for k in missing: print("    missing from the file:", k)
        for k in orphan:  print("    no longer in any page:", k)
        for k in human:   print("    English changed under a translation:", k)
        problems += len(missing) + len(orphan) + len(human)

        if stale and args.fix:
            for key, idx in stale:
                lines[idx] = '  %s: %s,' % (json.dumps(key), json.dumps(english[key], ensure_ascii=False))
            path.write_text("\n".join(lines))
            print("    refreshed %d untranslated line(s)" % len(stale))
        elif stale:
            for key, _ in stale[:25]:
                print("    stale English:", key)
            problems += len(stale)

    if args.fix:
        SNAPSHOT.write_text(json.dumps(english, indent=1, ensure_ascii=False, sort_keys=True))
        print("snapshot updated: %d keys" % len(english))

    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
