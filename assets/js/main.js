/* Bright Penny — banner + consent-gated analytics. No other JS runs on the site. */
(function () {
  "use strict";

  // Set the GA4 measurement ID here once the property exists.
  // While it still says XXXXXXXXXX, nothing is loaded even after consent.
  var GA_ID = "G-XXXXXXXXXX";

  var KEY = "bp-consent"; // "accepted" | "declined"
  var banner = document.getElementById("cookie-banner");
  var accept = document.getElementById("cookie-accept");
  var decline = document.getElementById("cookie-decline");
  var settings = document.getElementById("cookie-settings");

  function loadAnalytics() {
    if (!/^G-[A-Z0-9]+$/.test(GA_ID) || GA_ID.indexOf("XXXX") !== -1) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }

  function choice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode: banner shows again next visit */ }
  }

  if (banner) {
    var current = choice();
    if (current === "accepted") {
      loadAnalytics();
    } else if (current !== "declined") {
      banner.hidden = false;
    }
    if (accept) accept.addEventListener("click", function () {
      store("accepted");
      banner.hidden = true;
      loadAnalytics();
    });
    if (decline) decline.addEventListener("click", function () {
      store("declined");
      banner.hidden = true;
    });
  }

  if (settings) settings.addEventListener("click", function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    if (banner) banner.hidden = false;
    banner.scrollIntoView({ block: "end", behavior: "smooth" });
  });
})();
