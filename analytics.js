/*
 * PostHog product analytics for aerele.in (static site).
 *
 * Privacy model mirrors the Lens app: capturing starts OPTED OUT with in-memory
 * persistence, so PostHog writes no cookies and sends no events until the visitor
 * accepts the cookie banner. Declining (or "necessary only") keeps it off.
 *
 * Same PostHog project as lens.aerele.in. The cookie is set on the apex domain
 * (cross_subdomain_cookie defaults true), so a consented visitor is the same
 * person across aerele.in and lens.aerele.in — one cross-site funnel.
 *
 * The phc_ key is a public project API key; safe to ship in the page.
 */
(function () {
  "use strict";

  var KEY = "phc_AGPDGz8p3MMegGVe6s6KqqwLFdiqMBBhkfFfEvjH6ivR";
  var API_HOST = "https://us.i.posthog.com";
  var UI_HOST = "https://us.posthog.com";
  var CONSENT_KEY = "aerele_cookie_consent"; // values: "granted" | "denied"

  // --- official PostHog loader snippet (queues calls until array.js loads) ---
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  function storedConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function grant() {
    try {
      localStorage.setItem(CONSENT_KEY, "granted");
      posthog.set_config({ persistence: "localStorage+cookie" });
      posthog.opt_in_capturing();
      posthog.capture("$pageview");
    } catch (e) { /* analytics must never break the page */ }
  }

  function deny() {
    try {
      localStorage.setItem(CONSENT_KEY, "denied");
      posthog.opt_out_capturing();
      posthog.set_config({ persistence: "memory" });
    } catch (e) { /* no-op */ }
  }

  posthog.init(KEY, {
    api_host: API_HOST,
    ui_host: UI_HOST,
    // Manual pageviews so we control them and don't double-count on opt-in.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: true,
    person_profiles: "identified_only",
    // No cookies / events until the visitor consents.
    persistence: "memory",
    opt_out_capturing_by_default: true,
    loaded: function () {
      // Returning visitor who already accepted: opt in and record this pageview.
      if (storedConsent() === "granted") grant();
    },
  });

  // --- consent banner (only when the visitor hasn't decided yet) ---
  function showBanner() {
    var bar = document.createElement("div");
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;" +
      "background:#fff;border-top:1px solid #e2e8f0;box-shadow:0 -2px 12px rgba(0,0,0,.08);" +
      "padding:14px 16px;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#475569;";

    var wrap = document.createElement("div");
    wrap.style.cssText =
      "max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;";

    var text = document.createElement("p");
    text.style.cssText = "margin:0;flex:1 1 320px;";
    text.innerHTML =
      'We use privacy-friendly product analytics (PostHog) to understand how visitors use the site. ' +
      'We set no cookies and send no data until you accept. ' +
      '<a href="/privacy-policy/" style="color:#0f172a;text-decoration:underline;">Privacy policy</a>.';

    var btns = document.createElement("div");
    btns.style.cssText = "display:flex;gap:8px;flex:0 0 auto;";

    function mkBtn(label, primary) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.style.cssText = primary
        ? "background:#0f172a;color:#fff;border:0;border-radius:6px;padding:8px 14px;font-weight:600;cursor:pointer;"
        : "background:#fff;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:8px 14px;font-weight:600;cursor:pointer;";
      return b;
    }

    var decline = mkBtn("Decline", false);
    var accept = mkBtn("Accept", true);

    function close() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
    decline.addEventListener("click", function () { deny(); close(); });
    accept.addEventListener("click", function () { grant(); close(); });

    btns.appendChild(decline);
    btns.appendChild(accept);
    wrap.appendChild(text);
    wrap.appendChild(btns);
    bar.appendChild(wrap);
    document.body.appendChild(bar);
  }

  if (storedConsent() === null) {
    if (document.body) showBanner();
    else document.addEventListener("DOMContentLoaded", showBanner);
  }
})();
