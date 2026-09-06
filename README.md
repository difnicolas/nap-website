# NAP — Kingshot Kingdom 1886

A three-page static website:

| Page | File | What's on it |
| --- | --- | --- |
| Home | `index.html` | Welcome, what the NAP is, how to join |
| Rules | `rules.html` | Violation list, current KvK ruling, what's still allowed, reporting, punishments, appeals |
| Alliances | `alliances.html` | Directory: alliance, farm + academy, R5s, bear trap times (UTC/Local toggle) |
| Assignments | `assignments.html` | This week's Sanctuary and Fortress holders |
| Blacklist | `blacklist.html` | Players barred from joining a NAP alliance |
| Transfer | `transfer.html` | For alliances looking to move to K1886; R5 contact list |
| Notices | `notices.html` | Copy-paste in-game messages, sized to the 300/500 character limits |
| Resources | `resources.html` | Community Kingshot tools |

No build step, no framework, no dependencies. Open `index.html` in a browser and it works.

## Updating the content

**Alliance list, R5 names, bear trap times, kingdom number, Discord link, "last updated" date**
all live in one file:

```
assets/js/data.js
```

Everything else is written directly into the HTML pages (the rules text is in `rules.html`).

### Adding an alliance

Copy an existing block in `ALLIANCES` and edit it:

```js
{
  tag: "ABC",                                        // 3-letter tag, no brackets
  name: "Alliance Name",
  r5: "R5 in-game name",
  bear: ["12:00", "20:00"],                          // 24h UTC. Use [] if none.
  farm:    { tag: "ABF", name: "Farm name", r5: "..." },     // or null
  academy: { tag: "ABA", name: "Academy name", r5: "..." },  // or null
  note: "Recruiting",                                // optional, shown under the R5
},
```

Keep the commas and quotes. If the page goes blank after an edit, you have a typo —
open the browser console (F12) and it will point at the line.

Bear trap times must be entered in **UTC** (`"HH:MM"`, 24-hour). The site shows the UTC time
plus each visitor's local equivalent, and the header carries a live UTC clock so people can
check at a glance.

## Hosting it

Any static host works. Options, easiest first:

- **GitHub Pages** — push this folder to a repo, then Settings → Pages → Deploy from branch →
  `main` / root. Free, gives you `yourname.github.io/nap-website`.
- **Netlify / Cloudflare Pages** — drag the folder onto their dashboard. Free, custom domain
  supported.
- **Any web host** — upload the files by FTP. There is nothing to install.

## Theming

Colours, fonts and spacing are CSS variables at the top of `assets/css/style.css` (`:root`).
Change `--gold` to re-skin the whole site.

## The two trackers

Both are also driven by `assets/js/data.js`.

### Blacklist — `blacklist.html`

Edit the `BLACKLIST` array:

```js
{
  id: "292721357",                 // account ID — the identifier that can't be changed
  name: "CurrentName",
  aka: ["OldName"],                // other names they've used; [] if none
  alliance: "ABC",                 // tag at the time of the ruling, "" if none
  offence: "What they did",        // "" renders as "ruling not published"
  level: "severe" | "strike2" | "strike1" | "",
  listed: "2026-09-01",            // YYYY-MM-DD, or "" if unknown
  until:  "2026-09-15",            // YYYY-MM-DD, or null for open-ended
  status: "active" | "lifted",     // "lifted" = council ended it early
  ruling: "Optional one-line note",
},
```

`offence`, `level` and `listed` may be left empty — the row still renders, with those cells
marked as not published. Fill them in as rulings are written up. Search matches account IDs
and old names as well as current ones.

Timed listings **expire on their own** — once the `until` date passes the row moves to
"Expired" and stops counting as active. You never have to go back and edit it. Leave old
entries in place as a record (they stay visible under the "Expired & lifted" filter) or
delete them.

### Sanctuary & fortress assignments — `assignments.html`

Edit `HOLDINGS`. Each rotation, change `weekStart` and `weekEnd` (leave both `""` to hide the
dates), then update the `objectives` list. If `weekEnd` passes without an update, the page
shows an automatic "this board may be out of date" warning so nobody acts on a stale board.

There are 4 Fortresses and 10 Sanctuaries. `status` is either `assigned` (allocated to a NAP
alliance) or `ffa` (free-for-all, open to any alliance on the server). `alliance` stays `""`
until the pick is made.

### Current KvK ruling — the `KVK` block in `data.js`

A new agreement is negotiated with each server every KvK window, so this block is rewritten
every matchup. It renders into the "Current KvK ruling" section of `rules.html`.

```js
const KVK = {
  status: "agreed" | "negotiating" | "none",
  opponent: "Kingdom 2043",     // "" if not matched yet
  windowStart: "2026-09-14",    // YYYY-MM-DD
  windowEnd: "2026-09-21",
  updated: "2026-09-06",        // when the terms were last changed
  summary: "One line under the heading.",
  rules: [
    "One agreed term per line.",
    "They render as a numbered list.",
  ],
  note: "Anything that isn't a rule — contacts, timings.",
};
```

With `rules: []` the section explains that terms are not posted yet and tells players to wait
for the ruling — so it is safe to leave empty between windows. Once `windowEnd` passes, the
section shows an automatic "this window has closed, the terms below no longer apply" warning,
so a stale ruling can never be mistaken for the current one.

### Helpful resources — the `RESOURCES` array in `data.js`

Cards on `resources.html`. Add one by copying a block:

```js
{
  icon: "🛠",                      // any emoji
  name: "Tool Name",
  url: "https://example.com",
  what: "Short label",            // the uppercase line under the name
  desc: "What it is useful for.",
},
```

The domain shown at the bottom of each card is derived from `url`, and every card opens in a
new tab with `rel="noopener noreferrer"`.

### Transfer page

`transfer.html` needs no data of its own — the "who to contact" table is generated from
`ALLIANCES`, so it stays correct whenever you update the directory. The four-step process and
the FAQ are written into the HTML.

### In-game notices — the `NOTICES` array in `data.js`

Each entry has a `title`, a `desc`, a `short` version for the 300-character alliance notice and
a `long` version for the 500-character group message. Leave either as `""` and that box is not
rendered at all — the blacklist notice uses only the alliance-notice size. These tokens are substituted when the
page loads, so the tag list and the blacklist are always current:

| Token | Becomes |
| --- | --- |
| `{KINGDOM}` | `1886` |
| `{MAIN_TAGS}` | main alliance tags only |
| `{ALL_TAGS}` | mains + farms + academies |
| `{BLACKLIST}` | active listings as `Name 123456789` |
| `{BL_COUNT}` | how many players are currently listed |

The counter above each box is live and turns red past the limit, and the boxes are editable —
so if the blacklist grows and a notice tips over its limit, trim it in the browser before
copying.

## Languages

The site ships in English and can be switched to Korean, Spanish or Turkish from the globe
button in the navbar. The choice is remembered per browser.

**English is the HTML itself** — there is no English translation file, so editing an English
sentence on a page is all you need to do for English readers.

Everything translatable carries a `data-i18n="key"` attribute. The translations live in one
file per language:

```
assets/i18n/ko.js     Korean
assets/i18n/es.js     Spanish
assets/i18n/tr.js     Turkish
```

Each file is a flat list of `"key": "text"` lines, currently holding the **English source
text** so translators can overwrite it in place. Hand a translator the file and tell them:

> Replace only the text on the right of each colon. Never change the key. Keep HTML tags
> (`<strong>`, `<a href="…">`, `<span data-site="kingdom">1886</span>`) and entities
> (`&middot;`, `&mdash;`) exactly as they are — move them around if the grammar needs it, but
> do not delete or rename them. Leave a line in English if unsure; untranslated lines simply
> display in English.

The instructions are repeated at the top of each file.

Language files are loaded only when someone picks that language, so English visitors download
nothing extra.

### Keys

- `nav.*`, `footer.*` — shared across every page, translate once.
- `index.*`, `rules.*`, `alliances.*`, `assignments.*`, `blacklist.*`, `transfer.*`,
  `resources.*` — page prose, numbered in document order.
- `ui.*` — labels inside the tables and cards that JavaScript builds (column labels, status
  pills, the pre-launch notice).

If you add a new paragraph to a page, either give it a `data-i18n` key of its own and add that
key to the three language files, or leave it without one — an element with no key is simply
never translated.

### Keeping the language files in step

The language files hold English until someone translates them, so **editing English on a page
leaves those files behind** and readers in that language keep seeing the old wording. After
editing any page text, run:

```
python3 tools/sync-i18n.py          # report what is out of step
python3 tools/sync-i18n.py --fix    # refresh the lines nobody has translated yet
```

`assets/i18n/.english.json` records the English the tool last wrote. A line still matching that
snapshot has not been translated, so `--fix` refreshes it. A line that differs was written by a
translator: it is only reported, never overwritten, so no one's work is lost — those are the
lines a human needs to revisit. The tool also flags keys missing from a language file and keys
left over from deleted page text. (It does not track the `ui.*` labels, which live as literals
in `site.js`.)

## Pre-launch notice

A modal appears on the first page a visitor opens, saying the site is under construction and
pending NAP approval, and asking them not to share the link outside R5/R4 circles. It is
dismissed with the button, Escape, or a click outside, and it uses `sessionStorage`, so it
reappears the next time the browser is opened but not on every page navigation.

It is injected by `assets/js/site.js` (search for "Pre-launch notice") rather than pasted into
each page. **Delete that block when the site goes live** — or set the `nap-notice-seen` key —
and remove the `ui.notice.*` lines from the language files.

## If the browser shows an old version

The pages link their assets as `style.css?v=1`, `data.js?v=1`, `site.js?v=1`. After editing
`data.js` (or anything in `assets/`), bump that number in all the HTML files and in the
`assets/i18n/` line inside `site.js`:

```
sed -i '' 's/?v=1/?v=2/g' *.html assets/js/site.js
```

That forces every visitor's browser to fetch the new files instead of a cached copy. You only
need it when someone reports seeing stale content — a normal hard refresh (Cmd/Ctrl + Shift + R)
fixes it for one person.

## Hosting

Live at **https://kingdom1886.com**, served by GitHub Pages from the `main` branch, root
folder. Push to `main` and the live site updates within a minute or two.

The custom domain is recorded in the `CNAME` file at the repo root — **do not delete it**, or
the site falls back to `difnicolas.github.io/nap-website`. DNS is hosted at Network Solutions
with four A records and four AAAA records on the apex pointing at GitHub's Pages IPs. HTTPS is
enforced with a Let's Encrypt certificate that GitHub renews automatically.

### It is deliberately hidden from search

While the site is pending NAP approval it is public (GitHub Pages needs a public repo on the
free plan) but blocked from search engines by two things:

- `robots.txt`, which disallows all crawlers
- `<meta name="robots" content="noindex, nofollow">` in every page

Anyone with the link can read the site; nobody will find it through Google. **At launch**,
delete `robots.txt` and strip the meta tag:

```
rm robots.txt
sed -i '' '/name="robots"/d' *.html
```

Note that this is obscurity, not security — the blacklist and every other page are readable by
anyone who has the URL, and the repository itself is public. Do not put anything in here that
would actually harm someone if it leaked.
