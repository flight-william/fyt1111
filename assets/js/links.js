// External links.json loader for anti-blocking link rotation
(function () {
  'use strict';

  var LINKS_URL = '/links.json';

  function applyLinks(data) {
    if (!data) return;
    document.querySelectorAll('[data-link]').forEach(function (el) {
      var key = el.getAttribute('data-link');
      if (data[key]) {
        el.setAttribute('href', data[key]);
      }
    });
    // Update CS icon based on type
    if (data.cs_type) {
      document.querySelectorAll('[data-cs-type]').forEach(function (el) {
        el.setAttribute('data-cs-type', data.cs_type);
      });
    }
  }

  fetch(LINKS_URL)
    .then(function (res) { return res.json(); })
    .then(applyLinks)
    .catch(function () {
      // Fallback: hardcoded defaults remain in HTML
    });
})();
