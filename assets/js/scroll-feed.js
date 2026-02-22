// Inner slide navigation — horizontal carousel (all content in DOM for SEO)
(function () {
  'use strict';

  var feeds = document.querySelectorAll('.scroll-feed');
  if (!feeds.length) return;

  var wheelCooldowns = new WeakMap();

  feeds.forEach(function (feed) {
    var track = feed.querySelector('.scroll-feed-track');
    if (!track) return;

    // Skip wheel hijacking on section pages — let users scroll normally
    if (document.documentElement.classList.contains('is-section-page')) return;

    var blocks = Array.from(track.querySelectorAll('.scroll-block'));
    var controls = feed.querySelector('.scroll-controls');
    var dotsContainer = controls ? controls.querySelector('.scroll-dots') : null;
    var prevBtn = controls ? controls.querySelector('.scroll-prev') : null;
    var nextBtn = controls ? controls.querySelector('.scroll-next') : null;
    var total = blocks.length;

    if (total < 2) return;

    var current = 0;
    var inView = false;
    var complete = false;
    var feedHeight = 0;

    // Create dot indicators
    if (dotsContainer) {
      for (var i = 0; i < total; i++) {
        var dot = document.createElement('span');
        dot.className = 'scroll-dot' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        dot.addEventListener('click', (function (idx) {
          return function (e) {
            e.stopPropagation();
            goTo(idx);
          };
        })(i));
        dotsContainer.appendChild(dot);
      }
    }

    // Measure feed and set all blocks to the same fixed dimensions
    function measureAndSet() {
      feedHeight = feed.clientHeight;
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].style.height = feedHeight + 'px';
      }
    }

    function goTo(index) {
      if (index < 0 || index >= total || index === current) return;
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      updateDots();
      if (current === total - 1) {
        complete = true;
      }
    }

    function next() {
      if (current < total - 1) {
        goTo(current + 1);
      }
    }

    function prev() {
      if (current > 0) {
        goTo(current - 1);
        complete = false;
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      var dots = dotsContainer.querySelectorAll('.scroll-dot');
      for (var i = 0; i < dots.length; i++) {
        if (i === current) {
          dots[i].classList.add('active');
        } else {
          dots[i].classList.remove('active');
        }
      }
    }

    function resetFeed() {
      complete = false;
      current = 0;
      track.style.transform = 'translateX(0)';
      measureAndSet();
      updateDots();
    }

    // Prev/next buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        prev();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        next();
      });
    }

    // Visibility observer — reset feed when section comes into view
    if ('IntersectionObserver' in window) {
      var section = feed.closest('.page') || feed;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            inView = true;
            resetFeed();
          } else {
            inView = false;
          }
        });
      }, { threshold: 0.3 });
      obs.observe(section);
    }

    // Wheel event — scroll navigates slides
    var parentSection = feed.closest('.page');
    if (parentSection) {
      parentSection.addEventListener('wheel', function (e) {
        var now = Date.now();
        var lastWheel = wheelCooldowns.get(feed) || 0;
        if (now - lastWheel < 800) return;

        if (!complete) {
          e.preventDefault();
          e.stopPropagation();
          wheelCooldowns.set(feed, now);
          if (e.deltaY > 0) {
            next();
          } else if (e.deltaY < 0) {
            prev();
          }
        }
      }, { passive: false });
    }

    // Touch/swipe
    var touchStartY = 0;
    var touchStartX = 0;

    feed.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    feed.addEventListener('touchend', function (e) {
      var deltaY = touchStartY - e.changedTouches[0].clientY;
      var deltaX = touchStartX - e.changedTouches[0].clientX;

      // Only horizontal swipes navigate slides; vertical swipes pass through to page scroll
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        if (deltaX > 0) { next(); } else { prev(); }
      }
    }, { passive: true });

    // Resize handler
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measureAndSet();
        track.style.transition = 'none';
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        void track.offsetHeight;
        track.style.transition = '';
      }, 150);
    });

    // Initialize
    requestAnimationFrame(function () {
      measureAndSet();
    });

    // ResizeObserver fallback
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        var h = feed.clientHeight;
        if (h > 0 && h !== feedHeight) {
          feedHeight = h;
          for (var i = 0; i < blocks.length; i++) {
            blocks[i].style.height = h + 'px';
          }
          track.style.transition = 'none';
          track.style.transform = 'translateX(-' + (current * 100) + '%)';
          void track.offsetHeight;
          track.style.transition = '';
        }
      });
      ro.observe(feed);
    }

    // Expose API for scroll.js keyboard integration
    feed._scrollFeed = {
      isComplete: function () { return complete; },
      next: next,
      prev: prev,
      current: function () { return current; },
      total: function () { return total; }
    };
  });

  window._scrollFeeds = feeds;
})();
