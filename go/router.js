/* ============================================================
   Smart FX Facts — shared geo-router for all /go/ pages
   ------------------------------------------------------------
   Load order per page: ../config.js, then ../router.js.

   1. Detects the visitor's country: Cloudflare /cdn-cgi/trace on
      the live domain (no third-party call), ipapi.co as fallback
      for local previews, "other" as the last resort.
   2. Picks the default broker for the region:
        JP                                  → xmtrading
        TH MY PH BN SA AE QA KW BH OM EG    → xmglobal
        JO LB MA DZ TN IQ                   → xmglobal
        EU / EEA + UK                       → etoro
        everyone else                       → fxgt
                                                (avatrade if fxgt
                                                 isn't configured)
   3. Redirects with utm_source=site&utm_medium=cta appended,
      unless the URL already carries utm parameters.
   4. Graceful degradation: if the chosen broker's link is not
      configured yet (contains "REPLACE_ME") or the broker is
      inactive, the page stays up as a region/broker chooser
      instead of redirecting to a broken link.
   5. The chooser also shows the region-matched bonus callout from
      BONUS_CALLOUTS (config.js), or nothing for brokers without one.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.AFFILIATE_CONFIG || { AFFILIATE_LINKS: {}, ACTIVE_BROKERS: [] };

  var BROKERS = {
    xmtrading: { name: "XM Trading", blurb: "Licensed for residents of Japan" },
    xmglobal:  { name: "XM Global",  blurb: "Southeast Asia & Middle East — local deposits, MT4/MT5" },
    etoro:     { name: "eToro",      blurb: "Regulated for the EU, EEA & UK — copy trading built in" },
    fxgt:      { name: "FXGT",       blurb: "Global — tight spreads, crypto-friendly funding" },
    avatrade:  { name: "AvaTrade",   blurb: "Global alternative — regulated across 6 continents" },
    vantage:   { name: "Vantage",    blurb: "Coming soon" }
  };

  var SE_ASIA   = ["TH", "MY", "PH", "BN"];
  var MENA      = ["SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO", "LB", "MA", "DZ", "TN", "IQ"];
  var EU_EEA_UK = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
                   "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
                   "SE", "IS", "LI", "NO", "GB"];

  var REGION_LABELS = {
    europe: "Europe", japan: "Japan", seasia: "Southeast Asia",
    mena: "Middle East", other: "International"
  };

  function rawUrl(key)  { return (CFG.AFFILIATE_LINKS || {})[key] || ""; }
  function isActive(key) { return (CFG.ACTIVE_BROKERS || []).indexOf(key) !== -1; }
  function isUsable(key) {
    var u = rawUrl(key);
    return isActive(key) && !!u && u.indexOf("REPLACE_ME") === -1;
  }

  /* Append UTM tags unless the URL already has utm parameters */
  function withUtm(url) {
    if (!url || /[?&]utm_/.test(url)) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "utm_source=site&utm_medium=cta";
  }

  function countryToRegion(cc) {
    if (cc === "JP") return "japan";
    if (SE_ASIA.indexOf(cc) !== -1) return "seasia";
    if (MENA.indexOf(cc) !== -1) return "mena";
    if (EU_EEA_UK.indexOf(cc) !== -1) return "europe";
    return "other";
  }

  function regionBroker(region) {
    switch (region) {
      case "japan":  return "xmtrading";
      case "seasia":
      case "mena":   return "xmglobal";
      case "europe": return "etoro";
      default:       return isUsable("fxgt") ? "fxgt" : "avatrade";
    }
  }

  function detectCountry() {
    return fetch("/cdn-cgi/trace", { cache: "no-store" })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var m = t.match(/loc=([A-Z]{2})/);
        if (m && m[1] !== "XX" && m[1] !== "T1") return m[1];
        throw new Error("no country from cf trace");
      })
      .catch(function () {
        return fetch("https://ipapi.co/json/")
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j && j.country_code) return j.country_code;
            throw new Error("no country from ipapi");
          });
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function init() {
    var title  = document.getElementById("routerTitle");
    var msg    = document.getElementById("routerMsg");
    var choice = document.getElementById("routerChoice");
    if (!title || !msg || !choice) return;

    detectCountry()
      .then(function (cc) { route(countryToRegion(cc)); })
      .catch(function ()  { route("other"); });

    function route(region) {
      var key = regionBroker(region);
      if (isUsable(key)) {
        var url = withUtm(rawUrl(key));
        title.textContent = "Taking you to " + BROKERS[key].name + "…";
        msg.innerHTML = "Detected region: <b>" + esc(REGION_LABELS[region]) + "</b>. " +
          "If you are not redirected automatically, " +
          '<a href="' + esc(url) + '" rel="sponsored noopener">continue here</a>.';
        setTimeout(function () { window.location.replace(url); }, 1500);
      } else {
        showChoice(region);
      }
    }

    function showChoice(region) {
      title.textContent = "Choose your region";
      msg.textContent = "We partner with different regulated brokers per country. " +
                        "Pick your region to see the right partner for you:";
      choice.hidden = false;
      Array.prototype.forEach.call(choice.querySelectorAll(".geo-pill"), function (p) {
        p.addEventListener("click", function () { render(p.getAttribute("data-region")); });
      });
      render(region);
    }

    function render(region) {
      var key = regionBroker(region);
      var b = BROKERS[key] || { name: key, blurb: "" };
      var usable = isUsable(key);

      Array.prototype.forEach.call(choice.querySelectorAll(".geo-pill"), function (p) {
        p.classList.toggle("active", p.getAttribute("data-region") === region);
      });

      document.getElementById("recLine").innerHTML =
        "Recommended for <b>" + esc(REGION_LABELS[region]) + "</b>: <b>" + esc(b.name) + "</b>" +
        (usable ? "" : " — <span style=\"color:var(--accent)\">coming soon</span>");

      var bonusEl = document.getElementById("routerBonus");
      if (bonusEl) {
        var callout = window.bonusCalloutFor ? window.bonusCalloutFor(key, region) : null;
        if (callout && callout.text) {
          bonusEl.hidden = false;
          bonusEl.innerHTML =
            '<span class="bonus-pill">Bonus</span>' +
            '<span class="bonus-text">' + esc(callout.text) + "</span>" +
            '<span class="bonus-foot">' + esc(CFG.BONUS_FOOTNOTE || "") + "</span>";
        } else {
          bonusEl.hidden = true;
          bonusEl.innerHTML = "";
        }
      }

      var goBtn = document.getElementById("goBtn");
      if (usable) {
        goBtn.textContent = "Continue to " + b.name + " →";
        goBtn.href = withUtm(rawUrl(key));
        goBtn.removeAttribute("aria-disabled");
      } else {
        goBtn.textContent = "Coming soon";
        goBtn.removeAttribute("href");
        goBtn.setAttribute("aria-disabled", "true");
      }

      document.getElementById("brokerList").innerHTML = Object.keys(BROKERS).map(function (k) {
        var bb = BROKERS[k];
        if (isUsable(k)) {
          return '<li><a href="' + esc(withUtm(rawUrl(k))) + '" rel="sponsored noopener">' +
                 esc(bb.name) + "</a> — " + esc(bb.blurb) + "</li>";
        }
        return '<li><span style="color:var(--text-dim)">' + esc(bb.name) +
               ' — <span style="color:var(--accent)">coming soon</span></span></li>';
      }).join("");
    }
  }

  window.GeoRouter = { init: init, withUtm: withUtm };
})();
