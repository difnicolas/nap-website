/* ==========================================================================
   NAP — Kingdom 1886 | SITE DATA
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT to keep the site up to date.
   Everything below is plain data. Keep the commas and quotes where they are.
   ========================================================================== */

const SITE = {
  kingdom: "1886",
  // Shown in the footer. Set to "" to hide.
  discord: "",
  // Who maintains this page.
  maintainer: "Kingdom 1886 NAP Council",
  // Change this whenever you update the alliance list below.
  lastUpdated: "6 September 2026",
};

/* --------------------------------------------------------------------------
   ALLIANCES
   --------------------------------------------------------------------------
   One entry per alliance FAMILY (main + its farm + its academy).

   {
     tag:      "ABC",              // 3-letter in-game tag, no brackets
     name:     "Alliance Name",
     r5:       "R5 in-game name",
     bear:     ["12:00", "20:00"], // bear trap times, 24h UTC. [] if none yet.
     farm:     { tag: "ABF", name: "...", r5: "..." },   // or null
     academy:  { tag: "ABA", name: "...", r5: "..." },   // or null
     note:     "",                 // optional short line shown under the name
   }

   >>> REPLACE THE EXAMPLE ROWS BELOW WITH YOUR REAL KINGDOM 1886 DATA. <<<
   -------------------------------------------------------------------------- */

const ALLIANCES = [
  {
    tag: "A86",
    name: "Apex Predators",
    r5: "Defiant",
    bear: ["00:10", "15:00"],
    farm:    { tag: "86a", name: "", r5: "" },
    academy: null,
    note: "KvK alliance: KVK",
  },
  {
    tag: "D86",
    name: "Dragons",
    r5: "Sanceline",
    bear: ["14:00", "18:00", "22:00"],
    farm:    { tag: "D8F", name: "", r5: "" },
    academy: { tag: "86D", name: "", r5: "" },
    note: "",
  },
  {
    tag: "W86",
    name: "WIN",
    r5: "Gio",
    bear: ["13:00", "23:00"],
    farm:    { tag: "86W", name: "", r5: "" },
    academy: null,
    note: "",
  },
  {
    tag: "KTA",
    name: "KillThemAll",
    r5: "Yeager",
    bear: ["14:00", "23:00"],
    farm:    { tag: "KTa", name: "", r5: "" },
    academy: null,
    note: "",
  },
  {
    tag: "N86",
    name: "Notorious",
    r5: "NavyVet",
    bear: ["01:00", "18:00"],
    farm:    { tag: "N8F", name: "", r5: "" },
    academy: { tag: "n86", name: "", r5: "" },
    note: "",
  },
  {
    tag: "TCO",
    name: "Taco",
    r5: "Lord Taco",
    bear: ["14:00", "00:00"],
    farm:    null,
    academy: null,
    note: "",
  },
];

/* --------------------------------------------------------------------------
   BLACKLIST
   --------------------------------------------------------------------------
   Players who have lost NAP protection. One entry per ruling.

   {
     id:       "292721357",        // in-game account ID — the thing that never changes
     name:     "CurrentName",      // name they go by now
     aka:      ["OldName"],        // other names they have used. [] if none.
     alliance: "",                 // tag at the time of the ruling, "" if none
     offence:  "",                 // "" shows as "not published" — fill in when known
     level:    "severe" | "strike2" | "strike1" | "",
     listed:   "2026-09-01",       // YYYY-MM-DD, or "" if unknown
     until:    "2026-09-15",       // YYYY-MM-DD, or null for open-ended
     status:   "active" | "lifted",// "lifted" = council ended it early
     ruling:   "",                 // optional one-line note shown under the offence
   }

   Entries whose `until` date has passed are shown as EXPIRED automatically —
   you do not need to edit them. Leave them in place as a record, or delete them.
   -------------------------------------------------------------------------- */

const BLACKLIST = [
  {
    id: "292721357",
    name: "REVENGE",
    aka: ["erenoar"],
    alliance: "",
    offence: "",
    level: "",
    listed: "",
    until: null,
    status: "active",
    ruling: "",
  },
  {
    id: "289608604",
    name: "Murti",
    aka: [],
    alliance: "",
    offence: "",
    level: "",
    listed: "",
    until: null,
    status: "active",
    ruling: "",
  },
  {
    id: "292361256",
    name: "ZlyyD",
    aka: ["Fantoo"],
    alliance: "",
    offence: "",
    level: "",
    listed: "",
    until: null,
    status: "active",
    ruling: "",
  },
  {
    id: "289445200",
    name: "Kato!",
    aka: [],
    alliance: "",
    offence: "",
    level: "",
    listed: "",
    until: null,
    status: "active",
    ruling: "Listed until they apologise.",
  },
  {
    id: "290313734",
    name: "Ashes of Hell",
    aka: ["Ruler of the Sun"],
    alliance: "",
    offence: "",
    level: "",
    listed: "",
    until: null,
    status: "active",
    ruling: "",
  },
  {
    id: "289952309",
    name: "T\u00fcrkbeyi",
    aka: [],
    alliance: "",
    offence: "",
    level: "",
    listed: "",
    until: null,
    status: "active",
    ruling: "",
  },
];

/* --------------------------------------------------------------------------
   SANCTUARY & FORTRESS ASSIGNMENTS
   --------------------------------------------------------------------------
   The public board of who holds what.

   Update `weekStart` / `weekEnd` every rotation (YYYY-MM-DD) — the site shows a
   "may be out of date" banner automatically once weekEnd has passed. Leave both
   as "" to hide the dates entirely.

   objectives: {
     type:     "sanctuary" | "fortress",
     name:     "Objective name as it appears on the map",
     alliance: "ABC",              // tag holding it, "" if not picked yet
     r5:       "Contact name",     // optional
     status:   "assigned" | "ffa", // ffa = free-for-all, open to any alliance
     note:     "",                 // optional line under the status
   }

   There are 4 Fortresses and 10 Sanctuaries.
     - Fortresses go to the top 4 NAP alliances by power.
     - Every NAP alliance is assigned a Sanctuary; with 6 alliances in the pact
       that leaves 4 Sanctuaries as free-for-all.
   Rename these slots to the objective names as they appear on the map.
   -------------------------------------------------------------------------- */

const HOLDINGS = {
  weekStart: "",
  weekEnd: "",
  rotationNote: "Picks are made in power order, highest first.",
  objectives: [
    { type: "fortress",  name: "Fortress 1",  alliance: "", r5: "", status: "assigned", note: "" },
    { type: "fortress",  name: "Fortress 2",  alliance: "", r5: "", status: "assigned", note: "" },
    { type: "fortress",  name: "Fortress 3",  alliance: "", r5: "", status: "assigned", note: "" },
    { type: "fortress",  name: "Fortress 4",  alliance: "", r5: "", status: "assigned", note: "" },
    { type: "sanctuary", name: "Sanctuary 1",   alliance: "", r5: "", status: "assigned", note: "" },
    { type: "sanctuary", name: "Sanctuary 2",   alliance: "", r5: "", status: "assigned", note: "" },
    { type: "sanctuary", name: "Sanctuary 3",   alliance: "", r5: "", status: "assigned", note: "" },
    { type: "sanctuary", name: "Sanctuary 4",   alliance: "", r5: "", status: "assigned", note: "" },
    { type: "sanctuary", name: "Sanctuary 5",   alliance: "", r5: "", status: "assigned", note: "" },
    { type: "sanctuary", name: "Sanctuary 6",   alliance: "", r5: "", status: "assigned", note: "" },
    { type: "sanctuary", name: "Sanctuary 7",   alliance: "", r5: "", status: "ffa", note: "" },
    { type: "sanctuary", name: "Sanctuary 8",   alliance: "", r5: "", status: "ffa", note: "" },
    { type: "sanctuary", name: "Sanctuary 9",   alliance: "", r5: "", status: "ffa", note: "" },
    { type: "sanctuary", name: "Sanctuary 10",  alliance: "", r5: "", status: "ffa", note: "" },
  ],
};

/* --------------------------------------------------------------------------
   CURRENT KvK RULINGS
   --------------------------------------------------------------------------
   We negotiate a fresh agreement with each new server every KvK window, so this
   block changes every matchup. Update it as soon as the R5s settle terms.

   status:  "agreed"      — terms are set, the rules below are binding
            "negotiating" — matched up, terms not settled yet
            "none"        — no KvK window active
   Set windowStart / windowEnd (YYYY-MM-DD) and the site shows an
   "out of date" warning on its own once the window has passed.
   -------------------------------------------------------------------------- */

const KVK = {
  status: "negotiating",
  opponent: "",                 // e.g. "Kingdom 2043" — "" if not matched yet
  windowStart: "",              // "2026-09-14"
  windowEnd: "",                // "2026-09-21"
  updated: "",                  // "2026-09-06" — when these terms were last changed
  summary: "",                  // one line shown under the heading
  rules: [
    // One agreed term per line, e.g.:
    // "No hits on the opposing kingdom's TCs before the gates open.",
    // "Tile hits are open for the whole window on both sides.",
  ],
  note: "",                     // anything that isn't a rule (contacts, timings)
};

/* --------------------------------------------------------------------------
   HELPFUL RESOURCES
   --------------------------------------------------------------------------
   Third-party Kingshot tools. Add a card by copying a block.

   { icon: "🛠", name: "...", url: "https://...", what: "short label",
     desc: "what it is useful for" }

   These are community sites run by other people — not by the NAP council.
   -------------------------------------------------------------------------- */

const RESOURCES = [
  {
    icon: "⚔️",
    name: "Kingshot Optimizer",
    url: "https://kingshotoptimizer.com",
    what: "Upgrade & KvK planning",
    desc: "Work out the most efficient order to push your upgrades in, and plan which upgrades to run during a KvK window so they score points when it counts.",
  },
  {
    icon: "🧮",
    name: "Kingshot Calculator",
    url: "https://kingshotcalculator.com",
    what: "Costs & requirements",
    desc: "Calculate the exact resource and time cost of building and upgrading, so you know what to stockpile before you start.",
  },
  {
    icon: "🐻",
    name: "APX Tools",
    url: "https://apxtools.org",
    what: "Bear trap formations",
    desc: "Plan troop formations and ratios for bear trap, so your rally slots are filled with the right composition instead of guesswork.",
  },
];

/* --------------------------------------------------------------------------
   IN-GAME NOTICES
   --------------------------------------------------------------------------
   Ready-made messages to paste into the game. Each one has a short version for
   the 300-character alliance notice and a longer one for the 500-character
   group message.

   These tokens are filled in automatically, so the tag list and the blacklist
   never go stale:

     {KINGDOM}     1886
     {MAIN_TAGS}   the main alliance tags        A86, D86, W86, ...
     {ALL_TAGS}    each family joined by "-"     A86-86a, D86-D8F-86D, ...
     {BLACKLIST}   listed players with their account IDs
     {BL_COUNT}    how many players are currently listed

   The character counters on the page are live — edit the text there before
   copying if a token has pushed a notice over the limit.
   -------------------------------------------------------------------------- */

const NOTICES = [
  {
    title: "NAP alliance tags",
    desc: "Who is covered by the pact. Post this so nobody can claim they did not know which tags to leave alone.",
    short:
      "K{KINGDOM} NAP — do NOT attack these tags:\n" +
      "{ALL_TAGS}\n" +
      "Farms and academies included. Never hit a NAP Town Centre. NAP tiles only during All Out. Non-NAP: 2 TC hits max. Unsure? Ask your R5.",
    long:
      "K{KINGDOM} NAP alliances — these tags are off limits:\n" +
      "{ALL_TAGS}\n" +
      "Mains, farms and academies, all covered.\n" +
      "• NAP Town Centres: never attack.\n" +
      "• NAP resource tiles: only during All Out.\n" +
      "• Non-NAP players: 2 TC hits each, max.\n" +
      "• Never hit a march going to bear, a beast or a rally.\n" +
      "Hit someone by mistake? Repay it and tell your R5. Hit yourself? Screenshot it and report it — never retaliate.",
  },
  {
    title: "All Out rules",
    desc: "What changes and what does not when All Out opens. Post this at the start of every All Out.",
    short:
      "ALL OUT — what is allowed:\n" +
      "• NAP resource tiles: OPEN, this window only.\n" +
      "• NAP Town Centres: STILL OFF LIMITS. All Out changes nothing here.\n" +
      "• Non-NAP: 2 TC hits max, as always.\n" +
      "Report violations to your R5 with a screenshot. Never retaliate.",
    long:
      "ALL OUT is live. What changes and what does not:\n" +
      "OPEN — resource tiles of NAP members, for this window only. They go back to being a violation the moment it closes.\n" +
      "STILL BANNED — attacking a NAP member's Town Centre. All Out changes nothing here.\n" +
      "UNCHANGED — non-NAP players stay capped at 2 Town Centre hits each.\n" +
      "Hit by someone? Screenshot it and send it to your R5. Never hit back — retaliating is its own violation.",
  },
  {
    title: "Blacklist",
    desc: "Who may not be accepted into a NAP alliance. Post this after any change to the list, and before a recruitment push.",
    short:
      "NAP BLACKLIST ({BL_COUNT}) — may NOT join any NAP alliance, farm or academy:\n" +
      "{BLACKLIST}\n" +
      "Not permission to attack: they keep non-NAP protection, 2 TC hits max. Check the ID, names change.",
    long:
      "NAP BLACKLIST — {BL_COUNT} players listed:\n" +
      "{BLACKLIST}\n" +
      "They may not be accepted into any NAP alliance, farm or academy. Taking one in is a violation and the alliance answers for it.\n" +
      "Being listed is NOT permission to attack. A listed player counts as non-NAP and keeps that protection: 2 TC hits max.\n" +
      "Always check the account ID — listed players rename to hide.",
  },
];
