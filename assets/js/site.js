/* ==========================================================================
   NAP — Kingdom 1886 | site behaviour
   No dependencies. Content lives in assets/js/data.js and in the HTML pages;
   translations live in assets/i18n/<lang>.js.
   ========================================================================== */

var NAP = (function () {
  "use strict";

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function pad(v) { return String(v).padStart(2, "0"); }

  // "2026-09-01" -> Date at 00:00 UTC, or null if unset/malformed.
  function parseDay(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  }

  function fmtDay(s) {
    var d = parseDay(s);
    if (!d) return "—";
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }

  // Whole days from now until the END of the given day (UTC). Negative = past.
  function daysLeft(s) {
    var d = parseDay(s);
    if (!d) return null;
    return Math.ceil((d.getTime() + 864e5 - Date.now()) / 864e5);
  }

  /* ---- Translation ------------------------------------------------------
     Static page text carries data-i18n keys and its English is the markup
     itself, so English needs no dictionary. Other languages live in
     assets/i18n/<lang>.js and are fetched the first time they are picked.
     Anything missing from a dictionary falls back to English.
     ---------------------------------------------------------------------- */

  var LANGS = { en: "EN", ko: "KO", es: "ES", tr: "TR" };
  var lang = "en";
  try {
    var stored = localStorage.getItem("nap-lang");
    if (stored && LANGS[stored]) lang = stored;
  } catch (err) {}

  window.I18N = window.I18N || {};
  var renderers = [];   // re-run whenever the language changes

  function dict() { return window.I18N[lang] || {}; }

  function t(key, english) {
    var v = dict()[key];
    return (v !== undefined && v !== null && v !== "") ? v : english;
  }

  // The English original of each element, kept in memory rather than in a
  // data- attribute so the markup is not duplicated into the page weight.
  var english = new WeakMap();

  function applyI18n(root) {
    var d = dict();
    (root || document).querySelectorAll("[data-i18n]").forEach(function (el) {
      if (!english.has(el)) english.set(el, el.innerHTML);
      var v = d[el.getAttribute("data-i18n")];
      el.innerHTML = (v !== undefined && v !== null && v !== "") ? v : english.get(el);
    });
    document.documentElement.lang = lang;
  }

  function loadLang(l, done) {
    if (l === "en" || window.I18N[l]) return done();
    var s = document.createElement("script");
    s.src = "assets/i18n/" + l + ".js?v=1";
    s.onload = done;
    s.onerror = function () {
      if (window.console) console.warn("NAP: no translation file for " + l);
      done();
    };
    document.head.appendChild(s);
  }

  function refresh() {
    applyI18n();
    renderers.forEach(function (fn) { try { fn(); } catch (err) {} });
  }

  function setLang(l) {
    if (!LANGS[l]) return;
    lang = l;
    try { localStorage.setItem("nap-lang", l); } catch (err) {}
    loadLang(l, refresh);
  }

  function onLang(fn) { renderers.push(fn); }

  return {
    esc: esc, pad: pad, parseDay: parseDay, fmtDay: fmtDay, daysLeft: daysLeft,
    t: t, applyI18n: applyI18n, setLang: setLang, onLang: onLang,
    langs: LANGS,
    lang: function () { return lang; },
    boot: function () { loadLang(lang, refresh); },
  };
})();


/* ---- Shared chrome: language menu, nav state, SITE values, UTC clock ----- */
(function () {
  "use strict";

  var t = NAP.t;

  /* language switcher */
  var box = document.querySelector("[data-lang-switcher]");
  if (box) {
    var btn = box.querySelector(".lang-btn");
    var menu = box.querySelector(".lang-menu");
    var cur = box.querySelector(".lang-cur");
    var opts = box.querySelectorAll("[data-lang]");

    var sync = function () {
      if (cur) cur.textContent = NAP.langs[NAP.lang()] || "EN";
      opts.forEach(function (o) {
        o.setAttribute("aria-current", String(o.getAttribute("data-lang") === NAP.lang()));
      });
    };
    var close = function () {
      if (menu) menu.hidden = true;
      if (btn) btn.setAttribute("aria-expanded", "false");
    };

    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = menu.hidden;
        menu.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
      });
    }
    opts.forEach(function (o) {
      o.addEventListener("click", function () {
        NAP.setLang(o.getAttribute("data-lang"));
        sync();
        close();
      });
    });
    document.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    sync();
    NAP.onLang(sync);
  }

  /* current page in the nav */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  /* values from SITE — re-run after every language change, because
     translating the footer replaces the spans these fill in */
  function fillSite() {
    if (typeof SITE === "undefined") return;
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var key = el.getAttribute("data-site");
      if (SITE[key]) el.textContent = SITE[key];
    });
    var d = document.querySelector("[data-discord]");
    if (d) {
      var link = d.querySelector("a");
      if (SITE.discord && link) { link.href = SITE.discord; }
      else { d.remove(); }
    }
  }
  fillSite();
  NAP.onLang(fillSite);

  /* live UTC clock */
  var clock = document.querySelector("[data-clock]");
  if (clock) {
    var tick = function () {
      var n = new Date();
      clock.innerHTML = t("ui.utc", "UTC") + " <strong>" + NAP.pad(n.getUTCHours()) + ":" +
                        NAP.pad(n.getUTCMinutes()) + "</strong>";
    };
    tick();
    setInterval(tick, 10000);
    NAP.onLang(tick);
  }
})();


/* ---- Alliance directory ------------------------------------------------- */
(function () {
  "use strict";

  var host = document.getElementById("alliance-list");
  if (!host || typeof ALLIANCES === "undefined") return;

  var esc = NAP.esc, t = NAP.t;

  var tz = "utc";
  try { tz = localStorage.getItem("nap-tz") === "local" ? "local" : "utc"; } catch (err) {}

  // "20:00" (UTC) -> "16:00" in the visitor's own timezone.
  function toLocal(hhmm) {
    var parts = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim());
    if (!parts) return null;
    var n = new Date();
    var d = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(),
                              Number(parts[1]), Number(parts[2])));
    return NAP.pad(d.getHours()) + ":" + NAP.pad(d.getMinutes());
  }

  function bearSlot(times) {
    var label = t("ui.bear", "Bear trap") + " &middot; " +
                (tz === "local" ? t("ui.localTime", "Local Time") : t("ui.utc", "UTC"));
    var shown = (times || [])
      .map(function (x) { return tz === "local" ? toLocal(x) : String(x); })
      .filter(Boolean).map(esc).join(" &middot; ");
    return '<div class="slot"><div class="label">' + label + "</div>" +
      '<div class="value trap">' +
        (shown || '<span class="muted">' + t("ui.notSet", "Not set") + "</span>") +
      "</div></div>";
  }

  function slot(labelKey, labelEn) {
    return function (a) {
      var label = t(labelKey, labelEn);
      if (!a) {
        return '<div class="slot"><div class="label">' + label + "</div>" +
               '<div class="value"><span class="muted">&mdash; ' +
               t("ui.none", "none") + ' &mdash;</span></div></div>';
      }
      var shown = a.tag
        ? "[" + esc(a.tag) + "]" + (a.name ? " " + esc(a.name) : "")
        : esc(a.name);
      return '<div class="slot"><div class="label">' + label + "</div>" +
        '<div class="value">' + shown + "</div>" +
        (a.r5 ? '<div class="sub">' + t("ui.r5short", "R5") + ": " + esc(a.r5) + "</div>" : "") +
        "</div>";
    };
  }

  function cardHtml(a) {
    var farmSlot = slot("ui.farm", "Farm alliance");
    var acadSlot = slot("ui.academy", "Academy alliance");
    return '<article class="alliance-card">' +
      '<div class="alliance-head">' +
        '<span class="tag">' + esc(a.tag) + "</span>" +
        '<span class="alliance-name">' + esc(a.name) + "</span>" +
      "</div>" +
      '<div class="alliance-body">' +
        '<div class="slot">' +
          '<div class="label">' + t("ui.r5", "R5 (leader)") + "</div>" +
          '<div class="value">' + (a.r5 ? esc(a.r5)
            : '<span class="muted">' + t("ui.notListed", "Not listed") + "</span>") + "</div>" +
          (a.note ? '<div class="sub">' + esc(a.note) + "</div>" : "") +
        "</div>" +
        farmSlot(a.farm) +
        acadSlot(a.academy) +
        bearSlot(a.bear) +
      "</div>" +
    "</article>";
  }

  function render() {
    host.innerHTML = ALLIANCES.map(cardHtml).join("");
  }

  var tzButtons = document.querySelectorAll("[data-tz]");
  function syncTz() {
    tzButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-tz") === tz));
    });
  }
  tzButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tz = btn.getAttribute("data-tz");
      try { localStorage.setItem("nap-tz", tz); } catch (err) {}
      syncTz();
      render();
    });
  });
  syncTz();

  render();
  NAP.onLang(render);
})();


/* ---- Blacklist tracker -------------------------------------------------- */
(function () {
  "use strict";

  var host = document.getElementById("blacklist-body");
  if (!host || typeof BLACKLIST === "undefined") return;

  var esc = NAP.esc, t = NAP.t;
  var searchEl = document.getElementById("blacklist-search");
  var countEl = document.getElementById("blacklist-count");
  var filter = "active";

  function levelPill(level) {
    var map = {
      severe:  ["ui.level.severe", "Severe", "pill-strike"],
      strike2: ["ui.level.strike2", "Strike 2", "pill-warn"],
      strike1: ["ui.level.strike1", "Strike 1", "pill-warn"],
    };
    var m = map[level];
    if (!m) return '<span class="pill">' + esc(level) + "</span>";
    return '<span class="pill ' + m[2] + '">' + t(m[0], m[1]) + "</span>";
  }

  // A listing is only "active" until its `until` date passes (null = open-ended).
  function state(e) {
    if (e.status === "lifted") return "lifted";
    if (e.until && NAP.daysLeft(e.until) <= 0) return "expired";
    return "active";
  }

  function untilHtml(e) {
    var st = state(e);
    if (st === "lifted") return '<span class="muted">' + t("ui.liftedEarly", "Lifted early") + "</span>";
    if (!e.until) {
      return "<b>" + t("ui.openEnded", "Open-ended") + "</b>" +
             '<div class="sub">' + t("ui.untilCouncil", "Until the council votes to lift") + "</div>";
    }
    var left = NAP.daysLeft(e.until);
    return NAP.fmtDay(e.until) +
      (st === "active"
        ? '<div class="sub">' + left + " " +
          (left === 1 ? t("ui.day", "day") : t("ui.days", "days")) + " " +
          t("ui.remaining", "remaining") + "</div>"
        : '<div class="sub muted">' + t("ui.served", "Served") + "</div>");
  }

  function statusPill(st) {
    if (st === "active")  return '<span class="pill pill-strike">' + t("ui.blacklisted", "Blacklisted") + "</span>";
    if (st === "expired") return '<span class="pill pill-open">' + t("ui.expired", "Expired") + "</span>";
    return '<span class="pill pill-ok">' + t("ui.lifted", "Lifted") + "</span>";
  }

  // Columns with nothing in them anywhere are hidden entirely, rather than
  // rendering a table full of dashes. They come back on their own once the
  // council fills the field in for any entry.
  var cols = {
    offence: BLACKLIST.some(function (e) { return e.offence; }),
    level:   BLACKLIST.some(function (e) { return e.level; }),
    listed:  BLACKLIST.some(function (e) { return e.listed; }),
  };
  var visibleCols = 3;
  Object.keys(cols).forEach(function (k) {
    if (cols[k]) { visibleCols++; return; }
    var th = document.querySelector('[data-col="' + k + '"]');
    if (th) th.hidden = true;
  });

  function rowHtml(e) {
    var aka = (e.aka && e.aka.length)
      ? '<div class="sub">' + t("ui.aka", "a.k.a.") + " " + e.aka.map(esc).join(", ") + "</div>" : "";
    var alliance = e.alliance ? '<div class="sub mono">[' + esc(e.alliance) + "]</div>" : "";
    var strayRuling = (!cols.offence && e.ruling)
      ? '<div class="sub">' + esc(e.ruling) + "</div>" : "";

    return "<tr>" +
      '<td><div class="who">' + esc(e.name) + "</div>" + aka +
        (e.id ? '<div class="sub mono">' + t("ui.id", "ID") + " " + esc(e.id) + "</div>" : "") +
        alliance + strayRuling + "</td>" +
      (cols.offence
        ? "<td>" + (e.offence ? esc(e.offence) : '<span class="muted">&mdash;</span>') +
          (e.ruling ? '<div class="sub">' + esc(e.ruling) + "</div>" : "") + "</td>"
        : "") +
      (cols.level
        ? "<td>" + (e.level ? levelPill(e.level) : '<span class="muted">&mdash;</span>') + "</td>"
        : "") +
      (cols.listed
        ? '<td class="mono">' + (e.listed ? NAP.fmtDay(e.listed)
                                          : '<span class="muted">&mdash;</span>') + "</td>"
        : "") +
      "<td>" + untilHtml(e) + "</td>" +
      "<td>" + statusPill(state(e)) + "</td>" +
    "</tr>";
  }

  function render() {
    var term = (searchEl ? searchEl.value : "").trim().toLowerCase();

    var rows = BLACKLIST.filter(function (e) {
      var st = state(e);
      if (filter === "active" && st !== "active") return false;
      if (filter === "past" && st === "active") return false;
      if (!term) return true;
      return [e.name, e.id, (e.aka || []).join(" "), e.alliance, e.offence, e.ruling]
        .join(" ").toLowerCase().indexOf(term) !== -1;
    }).sort(function (a, b) {
      return String(b.listed || "").localeCompare(String(a.listed || ""));
    });

    host.innerHTML = rows.length
      ? rows.map(rowHtml).join("")
      : '<tr><td colspan="' + visibleCols + '"><div class="empty">' +
        t("ui.nothingToShow", "Nothing to show here.") + "</div></td></tr>";

    if (countEl) countEl.textContent = rows.length + " " + t("ui.shown", "shown");
  }

  var active = BLACKLIST.filter(function (e) { return state(e) === "active"; });
  function setStat(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  setStat("stat-active", active.length);
  setStat("stat-openended", active.filter(function (e) { return !e.until; }).length);
  setStat("stat-past", BLACKLIST.length - active.length);

  document.querySelectorAll("[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      filter = btn.getAttribute("data-filter");
      document.querySelectorAll("[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      render();
    });
  });
  if (searchEl) searchEl.addEventListener("input", render);

  render();
  NAP.onLang(render);
})();


/* ---- Sanctuary & fortress assignments ----------------------------------- */
(function () {
  "use strict";

  var sanct = document.getElementById("sanctuary-body");
  var fort = document.getElementById("fortress-body");
  if (!sanct || !fort || typeof HOLDINGS === "undefined") return;

  var esc = NAP.esc, t = NAP.t;

  function statusPill(status) {
    if (status === "assigned") return '<span class="pill pill-ok">' + t("ui.assigned", "Assigned") + "</span>";
    if (status === "ffa")      return '<span class="pill pill-info">' + t("ui.ffa", "Free for all") + "</span>";
    return '<span class="pill">' + esc(status || "—") + "</span>";
  }

  function rowHtml(o) {
    return "<tr>" +
      '<td><div class="who">' + esc(o.name) + "</div></td>" +
      "<td>" + (o.alliance
        ? '<span class="tag">' + esc(o.alliance) + "</span>"
        : '<span class="muted">&mdash;</span>') +
        (o.r5 ? '<div class="sub">' + t("ui.r5short", "R5") + ": " + esc(o.r5) + "</div>" : "") + "</td>" +
      "<td>" + statusPill(o.status) +
        (o.note ? '<div class="sub">' + esc(o.note) + "</div>" : "") + "</td>" +
    "</tr>";
  }

  function fill(el, type) {
    var rows = (HOLDINGS.objectives || []).filter(function (o) { return o.type === type; });
    el.innerHTML = rows.length
      ? rows.map(rowHtml).join("")
      : '<tr><td colspan="3"><div class="empty">' + t("ui.noneListed", "Nothing listed yet.") +
        "</div></td></tr>";
  }

  var objs = HOLDINGS.objectives || [];
  function setStat(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function render() {
    fill(sanct, "sanctuary");
    fill(fort, "fortress");

    var napCount = document.getElementById("nap-count");
    if (napCount && typeof ALLIANCES !== "undefined") napCount.textContent = ALLIANCES.length;

    var rot = document.getElementById("week-rotation");
    if (rot && HOLDINGS.rotationNote) rot.textContent = HOLDINGS.rotationNote;

    var start = NAP.parseDay(HOLDINGS.weekStart);
    var end = NAP.parseDay(HOLDINGS.weekEnd);
    var label = document.getElementById("week-label");
    if (label && start && end) {
      label.textContent = t("ui.weekOf", "Week of") + " " +
        NAP.fmtDay(HOLDINGS.weekStart) + " – " + NAP.fmtDay(HOLDINGS.weekEnd);
    }

    var banner = document.getElementById("week-stale");
    if (banner) banner.hidden = !(HOLDINGS.weekEnd && NAP.daysLeft(HOLDINGS.weekEnd) <= 0);

    setStat("stat-forts", objs.filter(function (o) { return o.type === "fortress"; }).length);
    setStat("stat-sancs", objs.filter(function (o) { return o.type === "sanctuary"; }).length);
    setStat("stat-ffa", objs.filter(function (o) { return o.status === "ffa"; }).length);
  }

  render();
  NAP.onLang(render);
})();


/* ---- Current KvK ruling ------------------------------------------------- */
(function () {
  "use strict";

  var host = document.getElementById("kvk-panel");
  if (!host || typeof KVK === "undefined") return;

  var esc = NAP.esc, t = NAP.t;

  function render() {
    var STATE = {
      agreed: {
        pill: '<span class="pill pill-ok">' + t("ui.kvk.agreed", "Terms agreed") + "</span>",
        blank: t("ui.kvk.blankAgreed",
          "No terms have been posted yet for this window. Ask your R5 before you march."),
      },
      negotiating: {
        pill: '<span class="pill pill-warn">' + t("ui.kvk.negotiating", "Being negotiated") + "</span>",
        blank: t("ui.kvk.blankNegotiating",
          "Terms are still being settled with the opposing kingdom. Until they are posted here, treat the matchup as no-agreement and wait for the ruling."),
      },
      none: {
        pill: '<span class="pill pill-open">' + t("ui.kvk.none", "No active window") + "</span>",
        blank: t("ui.kvk.blankNone",
          "No KvK window is running. Terms are posted here as soon as the next matchup is agreed."),
      },
    };
    var st = STATE[KVK.status] || STATE.none;

    var meta = [];
    if (KVK.opponent) {
      meta.push(t("ui.kvk.matched", "Matched against") + " <b>" + esc(KVK.opponent) + "</b>");
    }
    if (KVK.windowStart && KVK.windowEnd) {
      meta.push(t("ui.kvk.window", "Window") + " " +
                NAP.fmtDay(KVK.windowStart) + " – " + NAP.fmtDay(KVK.windowEnd));
    }
    if (KVK.updated) meta.push(t("ui.kvk.termsSet", "Terms set") + " " + NAP.fmtDay(KVK.updated));

    var stale = KVK.windowEnd && NAP.daysLeft(KVK.windowEnd) <= 0;
    var rules = KVK.rules || [];

    host.innerHTML =
      (stale
        ? '<div class="banner"><span class="icon">&#9888;</span><span>' +
          t("ui.kvk.stale", "This window has closed. The terms below are last matchup's and no longer apply — wait for the new ruling before acting on anything here.") +
          "</span></div>"
        : "") +
      '<div class="week-head">' +
        '<span class="wk">' + t("ui.kvk.title", "Current KvK ruling") + "</span> " + st.pill +
        (meta.length ? '<span class="rot">' + meta.join(" &middot; ") + "</span>" : "") +
      "</div>" +
      (KVK.summary ? "<p>" + esc(KVK.summary) + "</p>" : "") +
      (rules.length
        ? '<ol class="rule-list">' + rules.map(function (r) {
            return '<li><span class="rule-body">' + esc(r) + "</span></li>";
          }).join("") + "</ol>"
        : '<div class="empty">' + st.blank + "</div>") +
      (KVK.note ? '<div class="callout">' + esc(KVK.note) + "</div>" : "");
  }

  render();
  NAP.onLang(render);
})();


/* ---- R5 contact list (transfer page) ------------------------------------ */
(function () {
  "use strict";

  var host = document.getElementById("r5-contacts");
  if (!host || typeof ALLIANCES === "undefined") return;

  var esc = NAP.esc;
  var dash = '<span class="muted">&mdash;</span>';

  function sub(a) {
    if (!a) return dash;
    return '<span class="mono">[' + esc(a.tag) + "]</span>" + (a.name ? " " + esc(a.name) : "");
  }

  function render() {
    host.innerHTML = ALLIANCES.map(function (a) {
      return "<tr>" +
        '<td><span class="tag">' + esc(a.tag) + "</span>" +
          '<div class="sub">' + esc(a.name) + "</div></td>" +
        '<td><div class="who">' + (a.r5 ? esc(a.r5) : dash) + "</div>" +
          (a.note ? '<div class="sub">' + esc(a.note) + "</div>" : "") + "</td>" +
        "<td>" + sub(a.farm) + "</td>" +
        "<td>" + sub(a.academy) + "</td>" +
      "</tr>";
    }).join("");
  }

  render();
  NAP.onLang(render);
})();


/* ---- Helpful resources -------------------------------------------------- */
(function () {
  "use strict";

  var host = document.getElementById("resource-list");
  if (!host || typeof RESOURCES === "undefined") return;

  var esc = NAP.esc;

  function domain(url) {
    return String(url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  host.innerHTML = RESOURCES.map(function (r) {
    return '<a class="res-card" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<div class="res-top">' +
        '<span class="res-icon" aria-hidden="true">' + esc(r.icon || "⚙") + "</span>" +
        '<span class="res-name">' + esc(r.name) + "</span>" +
      "</div>" +
      (r.what ? '<div class="res-what">' + esc(r.what) + "</div>" : "") +
      '<p class="res-desc">' + esc(r.desc) + "</p>" +
      '<div class="res-link">' + esc(domain(r.url)) + " &nearr;</div>" +
    "</a>";
  }).join("");
})();


/* ---- Pre-launch notice --------------------------------------------------
   Shown once per browser session (sessionStorage), on whichever page the
   visitor opens first. Injected from here so it stays on one page of markup
   rather than being pasted into all seven HTML files.
   ------------------------------------------------------------------------ */
(function () {
  "use strict";

  var KEY = "nap-notice-seen";
  try {
    if (sessionStorage.getItem(KEY)) return;
  } catch (err) { /* no sessionStorage — show it anyway */ }

  var t = NAP.t;

  var overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "notice-title");

  function paint() {
    overlay.innerHTML =
      '<div class="modal">' +
        '<div class="modal-flag">' + t("ui.notice.flag", "Pre-launch") + "</div>" +
        '<h2 id="notice-title">' + t("ui.notice.title", "This site is under construction") + "</h2>" +
        "<p>" + t("ui.notice.body1",
          "It is still undergoing NAP approval before launch. If you have this link, it is only to review it and give feedback to Gio.") + "</p>" +
        '<p class="modal-warn">' + t("ui.notice.body2",
          "Please do not share it outside the R5 and R4 circles of NAP alliances.") + "</p>" +
        '<button class="btn btn-primary modal-close" type="button">' +
          t("ui.notice.button", "Understood") + "</button>" +
      "</div>";
    var btn = overlay.querySelector(".modal-close");
    if (btn) btn.addEventListener("click", dismiss);
  }

  function dismiss() {
    try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
    overlay.remove();
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) { if (e.key === "Escape") dismiss(); }

  paint();
  overlay.addEventListener("click", function (e) { if (e.target === overlay) dismiss(); });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  document.body.classList.add("modal-open");

  var btn = overlay.querySelector(".modal-close");
  if (btn && btn.focus) btn.focus();

  NAP.onLang(paint);
})();


/* ---- In-game notices ---------------------------------------------------- */
(function () {
  "use strict";

  var host = document.getElementById("notice-list");
  if (!host || typeof NOTICES === "undefined") return;

  var esc = NAP.esc, t = NAP.t;

  var LIMITS = { short: 300, long: 500 };

  function allTags() {
    if (typeof ALLIANCES === "undefined") return "";
    var out = [];
    ALLIANCES.forEach(function (a) {
      if (a.tag) out.push(a.tag);
      if (a.farm && a.farm.tag) out.push(a.farm.tag);
      if (a.academy && a.academy.tag) out.push(a.academy.tag);
    });
    return out.join(", ");
  }

  function mainTags() {
    if (typeof ALLIANCES === "undefined") return "";
    return ALLIANCES.map(function (a) { return a.tag; }).filter(Boolean).join(", ");
  }

  // Only players whose listing is still running.
  function activeListings() {
    if (typeof BLACKLIST === "undefined") return [];
    return BLACKLIST.filter(function (e) {
      if (e.status === "lifted") return false;
      if (e.until && NAP.daysLeft(e.until) <= 0) return false;
      return true;
    });
  }

  function blacklistLine() {
    return activeListings().map(function (e) {
      return e.name + (e.id ? " " + e.id : "");
    }).join(", ");
  }

  function fill(text) {
    var kingdom = (typeof SITE !== "undefined" && SITE.kingdom) ? SITE.kingdom : "";
    return String(text || "")
      .replace(/\{KINGDOM\}/g, kingdom)
      .replace(/\{MAIN_TAGS\}/g, mainTags())
      .replace(/\{ALL_TAGS\}/g, allTags())
      .replace(/\{BLACKLIST\}/g, blacklistLine())
      .replace(/\{BL_COUNT\}/g, String(activeListings().length));
  }

  function blockHtml(i, kind, label, text) {
    var limit = LIMITS[kind];
    var body = fill(text);
    var over = body.length > limit;
    return '<div class="notice-block">' +
      '<div class="notice-block-head">' +
        '<span class="notice-kind">' + label + "</span>" +
        '<span class="count-badge' + (over ? " over" : "") + '" data-count-for="' + i + "-" + kind + '">' +
          body.length + " / " + limit +
        "</span>" +
      "</div>" +
      '<textarea class="notice-text" spellcheck="false" rows="6" ' +
        'data-limit="' + limit + '" data-id="' + i + "-" + kind + '">' + esc(body) + "</textarea>" +
      '<button class="btn notice-copy" type="button" data-copy="' + i + "-" + kind + '">' +
        t("ui.notice.copy", "Copy") + "</button>" +
    "</div>";
  }

  function render() {
    host.innerHTML = NOTICES.map(function (n, i) {
      return '<article class="notice-card">' +
        '<div class="notice-head">' +
          "<h3>" + esc(n.title) + "</h3>" +
          (n.desc ? "<p>" + esc(n.desc) + "</p>" : "") +
        "</div>" +
        '<div class="notice-blocks">' +
          blockHtml(i, "short", t("ui.notice.alliance", "Alliance notice"), n.short) +
          blockHtml(i, "long", t("ui.notice.group", "Group message"), n.long) +
        "</div>" +
      "</article>";
    }).join("");

    // live character counters
    host.querySelectorAll(".notice-text").forEach(function (ta) {
      var limit = Number(ta.getAttribute("data-limit"));
      var badge = host.querySelector('[data-count-for="' + ta.getAttribute("data-id") + '"]');
      ta.addEventListener("input", function () {
        if (!badge) return;
        badge.textContent = ta.value.length + " / " + limit;
        badge.classList.toggle("over", ta.value.length > limit);
      });
    });

    // copy to clipboard, with a fallback for browsers that block the API
    host.querySelectorAll(".notice-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ta = host.querySelector('[data-id="' + btn.getAttribute("data-copy") + '"]');
        if (!ta) return;
        var done = function () {
          var was = btn.textContent;
          btn.textContent = t("ui.notice.copied", "Copied");
          btn.classList.add("copied");
          setTimeout(function () {
            btn.textContent = was;
            btn.classList.remove("copied");
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ta.value).then(done, function () {
            ta.select(); done();
          });
        } else {
          ta.select();
          try { document.execCommand("copy"); } catch (err) {}
          done();
        }
      });
    });
  }

  render();
  NAP.onLang(render);
})();


/* ---- Boot: fetch the saved language, then apply it ---------------------- */
NAP.boot();
