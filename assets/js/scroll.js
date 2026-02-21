// Full-page navigation + section reveals
(function () {
  'use strict';

  // ===== Section Reveal =====
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ===== Progress Bar =====
  var progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  // ===== Nav Background on Scroll =====
  var nav = document.querySelector('.nav-floating');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ===== Section Dots Active State =====
  var sections = document.querySelectorAll('[data-section]');
  var dots = document.querySelectorAll('.section-dot');
  if (sections.length && dots.length && 'IntersectionObserver' in window) {
    var dotObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = entry.target.getAttribute('data-section');
          dots.forEach(function (d) { d.classList.remove('active'); });
          var activeDot = document.querySelector('.section-dot[data-dot="' + idx + '"]');
          if (activeDot) activeDot.classList.add('active');
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(function (s) { dotObs.observe(s); });
  }

  // ===== Video Tap to Play =====
  document.querySelectorAll('.video-container').forEach(function (container) {
    container.addEventListener('click', function () {
      var video = container.querySelector('video');
      if (video) {
        if (video.paused) {
          video.play();
          container.classList.add('playing');
        } else {
          video.pause();
          container.classList.remove('playing');
        }
      }
    });
  });

  // ===== Auto-play Videos: play when visible, pause when not =====
  var autoVideos = document.querySelectorAll('.auto-video-section video');
  if (autoVideos.length && 'IntersectionObserver' in window) {
    var videoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.play();
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.3 });
    autoVideos.forEach(function (v) { videoObs.observe(v); });
  }

  // ===== Full-Page Keyboard Navigation =====
  var pages = Array.from(document.querySelectorAll('.page, .cover'));
  var totalPages = pages.length;
  var currentPageEl = document.querySelector('.current-page');
  var totalPagesEl = document.querySelector('.total-pages');

  if (totalPagesEl) totalPagesEl.textContent = totalPages;

  // Update page counter on scroll
  if (currentPageEl && 'IntersectionObserver' in window) {
    var pageObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = pages.indexOf(entry.target);
          if (idx >= 0 && currentPageEl) {
            currentPageEl.textContent = idx + 1;
          }
        }
      });
    }, { threshold: 0.5 });
    pages.forEach(function (p) { pageObs.observe(p); });
  }

  // Get current page index based on scroll position
  function getCurrentPageIndex() {
    var winH = window.innerHeight;
    var best = 0;
    var bestDist = Infinity;
    pages.forEach(function (p, i) {
      var rect = p.getBoundingClientRect();
      var mid = rect.top + rect.height / 2;
      var dist = Math.abs(mid - winH / 2);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  // Navigate to a specific page
  function goToPage(index) {
    if (index < 0) index = 0;
    if (index >= totalPages) index = totalPages - 1;
    pages[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Keyboard handler
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    var current = getCurrentPageIndex();
    var handled = false;

    // Check if current page has an incomplete scroll-feed
    var currentPage = pages[current];
    var feed = currentPage ? currentPage.querySelector('.scroll-feed') : null;
    var feedApi = feed && feed._scrollFeed;

    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        if (feedApi && !feedApi.isComplete()) {
          feedApi.next();
          handled = true;
        } else {
          goToPage(current + 1);
          handled = true;
        }
        break;
      case 'ArrowUp':
      case 'k':
        if (feedApi && feedApi.current() > 0) {
          feedApi.prev();
          handled = true;
        } else {
          goToPage(current - 1);
          handled = true;
        }
        break;
      case 'Home':
        goToPage(0);
        handled = true;
        break;
      case 'End':
        goToPage(totalPages - 1);
        handled = true;
        break;
      case 'Escape':
        goToPage(0);
        handled = true;
        break;
    }

    if (handled) e.preventDefault();
  });
})();
