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

  /* Real partner links, one per broker */
  AFFILIATE_LINKS: {
    vantage:   "https://REPLACE_ME/vantage",    // ← real Vantage partner link
    etoro:     "https://REPLACE_ME/etoro",      // ← real eToro partner link
    avatrade:  "https://REPLACE_ME/avatrade",   // ← real AvaTrade partner link
    xmtrading: "https://REPLACE_ME/xmtrading",  // ← real XM Trading (JP) partner link
    xmglobal:  "https://REPLACE_ME/xmglobal",   // ← real XM Global partner link
    fxgt:      "https://REPLACE_ME/fxgt"        // ← real FXGT partner link
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
  ACTIVE_BROKERS: ["etoro", "avatrade", "xmtrading", "xmglobal", "fxgt"]
};
