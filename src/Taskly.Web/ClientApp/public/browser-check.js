/**
 * Browser compatibility check — ES5 only.
 * Detects outdated browsers and redirects to /browser-unsupported.html.
 *
 * Must use ES5 syntax (var, function) so it actually executes in old browsers
 * before they choke on ES2015+ module scripts.
 */
(function () {
  'use strict';

  // Guard: don't redirect if already on the unsupported page
  if (window.location.pathname.indexOf('browser-unsupported') !== -1) {
    return;
  }

  var ua = navigator.userAgent || '';
  if (!ua) {
    return;
  }

  var isUnsupported = false;

  // --- Internet Explorer detection ---
  // IE 10 and below set document.documentMode; IE 11 has 'Trident/'
  if (typeof document.documentMode === 'number') {
    isUnsupported = true;
  } else if (ua.indexOf('Trident/') !== -1) {
    isUnsupported = true;
  } else if (ua.indexOf('MSIE ') !== -1) {
    isUnsupported = true;
  }

  // --- Edge Legacy (EdgeHTML, pre-Chromium) ---
  // Edge Legacy UA: "Edge/18.xxxxx" — Chromium Edge uses "Edg/" (no trailing 'e')
  if (!isUnsupported && ua.indexOf('Edge/') !== -1 && ua.indexOf('Edg/') === -1) {
    isUnsupported = true;
  }

  // --- Opera Mini ---
  if (!isUnsupported && ua.indexOf('Opera Mini') !== -1) {
    isUnsupported = true;
  }

  // Helper: extract first integer after a token in the UA string
  function getVersion(token) {
    var idx = ua.indexOf(token);
    if (idx === -1) {
      return null;
    }
    var start = idx + token.length;
    var match = ua.substring(start).match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  // --- Chrome / Chromium-based < 90 ---
  // Check Chrome last because many browsers include "Chrome" in their UA.
  // Exclude Edge (Edg/) and OPR (Opera) — they report their own versions separately.
  if (!isUnsupported && ua.indexOf('Chrome/') !== -1 && ua.indexOf('Edg/') === -1 && ua.indexOf('OPR/') === -1) {
    var chromeVer = getVersion('Chrome/');
    if (chromeVer !== null && chromeVer < 90) {
      isUnsupported = true;
    }
  }

  // --- Chromium Edge < 90 ---
  if (!isUnsupported && ua.indexOf('Edg/') !== -1) {
    var edgeVer = getVersion('Edg/');
    if (edgeVer !== null && edgeVer < 90) {
      isUnsupported = true;
    }
  }

  // --- Opera (Chromium) < 76 (roughly maps to Chrome 90) ---
  if (!isUnsupported && ua.indexOf('OPR/') !== -1) {
    var operaVer = getVersion('OPR/');
    if (operaVer !== null && operaVer < 76) {
      isUnsupported = true;
    }
  }

  // --- Firefox < 90 ---
  if (!isUnsupported && ua.indexOf('Firefox/') !== -1) {
    var firefoxVer = getVersion('Firefox/');
    if (firefoxVer !== null && firefoxVer < 90) {
      isUnsupported = true;
    }
  }

  // --- Safari < 15 ---
  // Safari UA contains "Safari/" but NOT "Chrome/" or "Chromium/".
  // Version is in "Version/XX.Y".
  if (!isUnsupported && ua.indexOf('Safari/') !== -1 && ua.indexOf('Chrome/') === -1 && ua.indexOf('Chromium/') === -1) {
    var safariVer = getVersion('Version/');
    if (safariVer !== null && safariVer < 15) {
      isUnsupported = true;
    }
  }

  if (isUnsupported) {
    window.location.replace('/browser-unsupported.html');
  }
})();
