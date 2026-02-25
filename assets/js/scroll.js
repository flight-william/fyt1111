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

  // ===== Lazy-load Videos: load src when 1 section away, play when visible =====
  var autoVideos = document.querySelectorAll('.auto-video-section video');
  if (autoVideos.length && 'IntersectionObserver' in window) {
    // Preload observer — triggers when video enters viewport (yields bandwidth to fonts/images first)
    var preloadObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var video = entry.target;
          var source = video.querySelector('source[data-src]');
          if (source) {
            source.setAttribute('src', source.getAttribute('data-src'));
            source.removeAttribute('data-src');
            video.preload = 'auto';
            video.load();
          }
          // Seek to data-start time once metadata is ready
          var startTime = parseFloat(video.getAttribute('data-start'));
          if (startTime) {
            video.addEventListener('loadedmetadata', function () {
              video.currentTime = startTime;
            }, { once: true });
          }
          preloadObs.unobserve(video);
        }
      });
    }, { rootMargin: '0px' });

    // Reset to data-start on loop
    autoVideos.forEach(function (v) {
      var st = parseFloat(v.getAttribute('data-start'));
      if (st) {
        v.addEventListener('timeupdate', function () {
          if (v.currentTime < st && !v.seeking) {
            v.currentTime = st;
          }
        });
      }
    });

    // Play/pause observer — triggers when video is visible
    var videoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var p = entry.target.play();
          if (p) p.catch(function () {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.3 });

    autoVideos.forEach(function (v) {
      preloadObs.observe(v);
      videoObs.observe(v);
    });
  }

  // ===== Scroll Indicator — click to scroll, fade on leave =====
  var scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.style.cursor = 'pointer';
    scrollIndicator.addEventListener('click', function () {
      var nextSection = document.querySelector('.page');
      if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // Hide indicator once user scrolls past cover
    var coverEl = document.getElementById('cover');
    if (coverEl && 'IntersectionObserver' in window) {
      var indicatorObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          scrollIndicator.style.opacity = entry.isIntersecting ? '' : '0';
          scrollIndicator.style.transition = 'opacity 0.6s ease';
        });
      }, { threshold: 0.5 });
      indicatorObs.observe(coverEl);
    }
  }

  // ===== Full-Page Keyboard Navigation =====
  var isSectionPage = document.documentElement.classList.contains('is-section-page');

  // Section pages: force scroll to top (prevent scroll restoration to bottom)
  if (isSectionPage) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    // Belt-and-suspenders: beat any async scroll restoration
    setTimeout(function () { window.scrollTo(0, 0); }, 0);
  }

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

  // ===== Wheel / Touch — one gesture = one section =====
  if (!isSectionPage && pages.length > 1) {
    var scrolling = false;
    var cooldown = 800; // ms lockout after each transition

    window.addEventListener('wheel', function (e) {
      if (scrolling) return;
      var dir = e.deltaY > 0 ? 1 : -1;
      var current = getCurrentPageIndex();

      // At boundaries (first page up, last page down) — let native scroll handle it (footer, etc.)
      var next = current + dir;
      var atBoundary = (next < 0 || next >= totalPages);

      // Check if current section has an incomplete scroll-feed
      var currentPage = pages[current];
      var feed = currentPage ? currentPage.querySelector('.scroll-feed') : null;
      var feedApi = feed && feed._scrollFeed;

      if (dir > 0 && feedApi && !feedApi.isComplete()) {
        e.preventDefault();
        feedApi.next();
        scrolling = true;
        setTimeout(function () { scrolling = false; }, cooldown);
        return;
      }
      if (dir < 0 && feedApi && feedApi.current() > 0) {
        e.preventDefault();
        feedApi.prev();
        scrolling = true;
        setTimeout(function () { scrolling = false; }, cooldown);
        return;
      }

      if (atBoundary) return; // let native scroll reach footer/top
      e.preventDefault();
      scrolling = true;
      goToPage(next);
      setTimeout(function () { scrolling = false; }, cooldown);
    }, { passive: false });

    // Touch support — swipe up/down
    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      if (scrolling) return;
      var diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return; // ignore small swipes
      var dir = diff > 0 ? 1 : -1;
      var current = getCurrentPageIndex();

      var currentPage = pages[current];
      var feed = currentPage ? currentPage.querySelector('.scroll-feed') : null;
      var feedApi = feed && feed._scrollFeed;

      if (dir > 0 && feedApi && !feedApi.isComplete()) {
        feedApi.next();
        scrolling = true;
        setTimeout(function () { scrolling = false; }, cooldown);
        return;
      }
      if (dir < 0 && feedApi && feedApi.current() > 0) {
        feedApi.prev();
        scrolling = true;
        setTimeout(function () { scrolling = false; }, cooldown);
        return;
      }

      var next = current + dir;
      if (next < 0 || next >= totalPages) return;
      scrolling = true;
      goToPage(next);
      setTimeout(function () { scrolling = false; }, cooldown);
    }, { passive: true });
  }

  // Keyboard handler — skip on section pages so normal scrolling works
  if (!isSectionPage) {
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
  }
})();
