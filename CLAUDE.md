# Notes for Claude — Kingdom 1886 NAP site

Read `README.md` first: it covers the pages, `assets/js/data.js`, translations and hosting.
This file holds what the README does not — working habits and open threads — so a session on
any machine picks up where the last one left off.

**This repo is public and GitHub Pages serves every file in it (`.nojekyll`), this one
included, at kingdom1886.com.** Keep personal details, emails and machine paths out of it.

## Making changes

- Alliance, blacklist, KvK and site data: `assets/js/data.js`. Bump `SITE.lastUpdated` when
  the alliance list changes.
- After editing English text in any page, run `python3 tools/sync-i18n.py --fix`, then run it
  again without `--fix` to confirm everything is in step. New `ui.*` labels used in `site.js`
  are added by hand to `assets/i18n/ko.js`, `es.js` and `tr.js` (still English placeholders).
- After changing anything in `assets/`, bump the `?v=N` on that asset's links in **every**
  `*.html` page (and the `assets/i18n/` version inside `site.js` if the language files
  changed), so visitors don't get stale cached files. Each asset has its own number;
  `grep -o '?v=[0-9]*' *.html | sort | uniq -c` shows where they stand.
- Preview locally: `python3 -m http.server 8086 --bind 127.0.0.1`, then open
  http://127.0.0.1:8086/alliances.html.

## Going live

- Pushing to `main` deploys to https://kingdom1886.com within a minute or two.
- **Only push when the owner asks.** Approval to push once doesn't cover later changes.
- After pushing, confirm the live site by fetching a changed file with a cache-busting query,
  e.g. `curl -s "https://kingdom1886.com/assets/js/data.js?t=$RANDOM" | grep '<new text>'`.

## Things to know

- **In-game chat is capped at 512 characters.** The per-rule "copy for chat" buttons on
  `rules.html` stay under it by leaving out `<em>` side notes and `.chat-skip` spans. When
  editing a rule's title or punishments, re-check that its copied text is ≤ 512 (rule 10 is
  closest, around 510). Alliance notices are capped at 300, group messages at 500.
- **Alliance decrees** (`decree:` in each alliance entry) are the alliance's in-game decree,
  copied exactly as given, one string per line, `""` for a blank line. The card shows three
  lines with a Show more / Show less toggle. Decrees are not translated.

## Open threads

Bear trap times that disagree with the alliance's own decree. The owner is asking each
alliance to confirm and wants **both sides left as they are** until then:

- A86 Apex: decree says 15:00 & 00:00 UTC; listed 00:10, 15:00.
- D86 Dragons: decree says 15:00 / 18:00 / 22:00 UTC; listed 14:00 / 18:00 / 20:00
  (third trap moved from 22:00 to 20:00 on 31 Oct 2026).

Missing details:

- C86 (R5 CristinaPc) has no alliance name yet.
