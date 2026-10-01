/* ============================================================
   Smart FX Facts — central affiliate configuration
   ------------------------------------------------------------
   Replace every "REPLACE_ME" value with your real link/ID before
   going live. While a value still contains "REPLACE_ME" the site
   degrades gracefully instead of sending visitors to broken
   links: /go/ pages show a region/broker chooser and email
   forms show a "Coming soon" message.
   ============================================================ */
window.AFFILIATE_CONFIG = {

  /* Real partner links, one per broker.
     xmtrading / fxgt / avatrade are plain URLs. xmglobal and etoro
     resolve per country / language: an exact country match in `links`
     wins, otherwise `default` is used. Always read these through
     window.affiliateLinkFor(brokerKey, countryCode) — never directly. */
  AFFILIATE_LINKS: {
    vantage:   "https://REPLACE_ME/vantage",    // ← real Vantage partner link
    avatrade:  "https://REPLACE_ME/avatrade",   // still missing — stays REPLACE_ME (fallback only, unused while FXGT is active)
    fxgt:      "https://fxgt.link?refid=fxgtNihon",              // global — one link for every region
    xmtrading: "https://clicks.affstrack.com/c?c=438318&l=en&p=6",  // JP partner code за рег. форма: 8HDXW (see BROKER_TIPS)
    xmglobal:  {
      links: {
        TH: "https://clicks.pipaffiliates.com/c?c=507156&l=th&p=6161",
        MY: "https://clicks.pipaffiliates.com/c?c=469889&l=ms&p=6161",
        PH: "https://clicks.pipaffiliates.com/c?c=805464&l=en&p=6161",
        ZA: "https://clicks.pipaffiliates.com/c?c=453165&l=en&p=6161"
      },
      default: "https://clicks.pipaffiliates.com/c?c=805464&l=en&p=6161"
      // Останалите XMGlobal страни (BN, SA, AE, QA, KW, BH, OM, EG, JO, LB, MA, DZ, TN, IQ) ползват
      // PH default-а; при нужда потребителят да даде специфични кампании.
    },
    etoro:     {
      links: {
        FR: "https://med.etoro.com/B22473_A92557_TClick.aspx",
        IT: "https://med.etoro.com/B22477_A92557_TClick.aspx"
      },
      default: "https://med.etoro.com/B22474_A92557_TClick.aspx"   // EN — default за цялото ЕС/EEA+UK
    }
  },

  /* Formspree form ID (from https://formspree.io dashboard) */
  FORMSPREE_FORM_ID: "REPLACE_ME",

  /* Access key for the full /signals/ feed. The signals page unlocks
     when it sees ?key=THIS_VALUE (or after the unlock form verifies
     the visitor and hands out a link containing it). While this is
     still "REPLACE_ME" the feed stays in free-preview mode.
     MVP NOTE: this is security-through-obscurity — replace with real
     server-side verification before treating the gate as protection. */
  UNLOCK_KEY: "REPLACE_ME",

  /* Telegram channel invite link */
  TELEGRAM_CHANNEL: "https://t.me/REPLACE_ME",

  /* Brokers that are live. Anything not listed here is treated
     as "coming soon" (no redirect, CTA disabled). */
  ACTIVE_BROKERS: ["etoro", "avatrade", "xmtrading", "xmglobal", "fxgt"],

  /* Region-specific bonus callouts, keyed by broker id. `regions` is a
     comma-separated country-code list; "*" matches every region. Brokers
     with no entry (etoro, avatrade — no standard no-deposit bonus) never
     show a callout. Values verified Sep 2026 via Japanese affiliate sites.
     Бонус сумите се сменят тук; всеки callout трябва да има footnote
     'T&Cs apply — check the current offer on the broker's site' (защото
     офертите се сменят). */
  BONUS_CALLOUTS: {
    xmtrading: { regions: "JP",
                 text: "¥13,000 no-deposit bonus + 100% deposit bonus up to $10,500" },
    xmglobal:  { regions: "TH,MY,PH,BN,ZA,SA,AE,QA,KW,BH,OM,EG,JO,LB,MA,DZ,TN,IQ",
                 text: "Welcome bonus up to $30 — no deposit required" },
    /* verify current XMGlobal offer in partner portal */
    fxgt:      { regions: "*",
                 text: "No-deposit welcome bonus — amounts vary by region (up to ¥20,000 in Japan). Check the current offer" }
    /* FXGT променя бонуса месечно — сменяй тук */
  },

  /* Compliance footnote rendered under every callout (see BONUS_CALLOUTS). */
  BONUS_FOOTNOTE: "T&Cs apply — check the current offer on the broker's site. " +
                  "Bonuses are trading credit, not withdrawable cash. Trading involves risk.",

  /* Optional per-broker tips on the broker card. Same `regions`
     semantics as BONUS_CALLOUTS. The code is typed by the trader into
     the broker's registration form — it is NOT part of the URL. */
  BROKER_TIPS: {
    xmtrading: { regions: "JP", code: "8HDXW" }   // JP partner code за рег. форма
  }
};

/* ============================================================
   Bonus callout resolver — shared by the homepage broker card
   (index.html) and the /go/ router (go/router.js). Call
   window.bonusCalloutFor(brokerKey, region) with a region key:
   "japan" | "seasia" | "mena" | "europe" | "other". Returns the
   matching callout object or null. The country lists mirror
   go/router.js — keep them in sync.
   ============================================================ */
(function () {
  "use strict";

  var SE_ASIA   = ["TH", "MY", "PH", "BN"];
  var MENA      = ["SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO", "LB", "MA", "DZ", "TN", "IQ"];
  var EU_EEA_UK = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
                   "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
                   "SE", "IS", "LI", "NO", "GB"];

  function ccToRegion(cc) {
    if (cc === "JP") return "japan";
    if (SE_ASIA.indexOf(cc) !== -1) return "seasia";
    if (MENA.indexOf(cc) !== -1) return "mena";
    if (EU_EEA_UK.indexOf(cc) !== -1) return "europe";
    return "other";
  }

  /* Callout whose `regions` cover the given region key. "*" always
     matches; otherwise at least one listed country must map to the
     region. Brokers absent from BONUS_CALLOUTS always return null. */
  window.bonusCalloutFor = function (brokerKey, region) {
    var c = ((window.AFFILIATE_CONFIG || {}).BONUS_CALLOUTS || {})[brokerKey];
    if (!c || !c.text) return null;
    var r = String(c.regions || "*").replace(/\s+/g, "");
    if (r === "*") return c;
    return r.split(",").some(function (cc) { return ccToRegion(cc) === region; }) ? c : null;
  };

  /* Affiliate URL for a broker + ISO country code (upper- or lowercase)
     as detected by the geo logic. Plain-string entries return as-is;
     { links: {CC: url}, default: url } entries prefer an exact country
     match and fall back to `default`. Returns "" when the broker has
     no entry or nothing is configured for it. */
  window.affiliateLinkFor = function (brokerKey, countryCode) {
    var entry = (((window.AFFILIATE_CONFIG || {}).AFFILIATE_LINKS) || {})[brokerKey];
    if (!entry) return "";
    if (typeof entry === "string") return entry;
    var cc = String(countryCode || "").toUpperCase().replace(/\s+/g, "");
    if (cc && entry.links && typeof entry.links[cc] === "string") return entry.links[cc];
    return typeof entry.default === "string" ? entry.default : "";
  };

  /* Registration-tip (e.g. partner code) for a broker + region key, or
     null. Same matching rule as bonusCalloutFor. */
  window.brokerTipFor = function (brokerKey, region) {
    var t = ((window.AFFILIATE_CONFIG || {}).BROKER_TIPS || {})[brokerKey];
    if (!t || !t.code) return null;
    var r = String(t.regions || "*").replace(/\s+/g, "");
    if (r === "*") return t;
    return r.split(",").some(function (cc) { return ccToRegion(cc) === region; }) ? t : null;
  };
})();
