// Language toggle with localStorage persistence
(function () {
  'use strict';

  var STORAGE_KEY = 'fyt-lang';

  // On page load, check if user has a saved preference
  var saved = localStorage.getItem(STORAGE_KEY);
  var currentPath = window.location.pathname;
  var isEn = currentPath.indexOf('/en') === 0;
  var currentLang = isEn ? 'en' : 'zh';

  // Redirect if saved preference differs from current page
  if (saved && saved !== currentLang) {
    if (saved === 'en' && !isEn) {
      window.location.href = '/en/';
      return;
    } else if (saved === 'zh' && isEn) {
      window.location.href = '/';
      return;
    }
  }

  // Save current language
  localStorage.setItem(STORAGE_KEY, currentLang);

  // Toggle click handler
  document.querySelectorAll('[data-lang-toggle]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var targetLang = el.getAttribute('data-lang-toggle');
      localStorage.setItem(STORAGE_KEY, targetLang);
    });
  });
})();
