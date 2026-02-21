// Inner auto-scroll PPT slides — horizontal carousel (all content in DOM for SEO)
(function () {
  'use strict';

  var feeds = document.querySelectorAll('.scroll-feed');
  if (!feeds.length) return;

  var wheelCooldowns = new WeakMap();

  feeds.forEach(function (feed) {
    var track = feed.querySelector('.scroll-feed-track');
    if (!track) return;

    var blocks = Array.from(track.querySelectorAll('.scroll-block'));
    var controls = feed.querySelector('.scroll-controls');
    var dotsContainer = controls ? controls.querySelector('.scroll-dots') : null;
    var prevBtn = controls ? controls.querySelector('.scroll-prev') : null;
    var nextBtn = controls ? controls.querySelector('.scroll-next') : null;
    var total = blocks.length;

    if (total < 2) return;

    var current = 0;
    var interval = parseInt(feed.dataset.scrollInterval) || 7000;
    var timer = null;
    var paused = false;
    var inView = false;
    var complete = false;
    var progressBar = null;
    var feedHeight = 0;

    // Create progress bar
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.width = '0%';
    feed.appendChild(progressBar);

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
            pauseFeed();
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

    // Horizontal offset: each block is 100% width of feed
    function getOffset(index) {
      return index * 100; // percentage-based
    }

    function goTo(index) {
      if (index < 0 || index >= total || index === current) return;

      current = index;

      // Translate track horizontally
      var offset = getOffset(current);
      track.style.transform = 'translateX(-' + offset + '%)';

      updateDots();
      resetProgress();

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

    function resetProgress() {
      if (!progressBar) return;
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      void progressBar.offsetHeight;
      if (!paused && inView && current < total - 1) {
        progressBar.style.transition = 'width ' + interval + 'ms linear';
        progressBar.style.width = '100%';
      }
    }

    function startTimer() {
      stopTimer();
      if (paused || !inView) return;

      resetProgress();

      timer = setInterval(function () {
        if (current < total - 1) {
          next();
        } else {
          // Feed complete — stop, auto-advance page after delay
          stopTimer();
          if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
          }
          setTimeout(function () {
            if (!paused && inView) {
              autoAdvancePage();
            }
          }, interval);
        }
      }, interval);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
      }
    }

    function pauseFeed() {
      paused = true;
      feed.classList.add('scroll-paused');
      stopTimer();
    }

    function resumeFeed() {
      paused = false;
      feed.classList.remove('scroll-paused');
      if (inView) startTimer();
    }

    function togglePause() {
      if (paused) {
        resumeFeed();
      } else {
        pauseFeed();
      }
    }

    function resetFeed() {
      complete = false;
      paused = false;
      feed.classList.remove('scroll-paused');
      current = 0;
      track.style.transform = 'translateX(0)';
      measureAndSet();
      updateDots();
    }

    function autoAdvancePage() {
      var section = feed.closest('.page');
      if (!section) return;
      var nextEl = section.nextElementSibling;
      while (nextEl && !nextEl.classList.contains('page') && !nextEl.classList.contains('cover')) {
        nextEl = nextEl.nextElementSibling;
      }
      if (nextEl) {
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Click to toggle pause
    feed.addEventListener('click', function (e) {
      if (e.target.closest('.scroll-controls')) return;
      togglePause();
    });

    // Prev/next buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        prev();
        pauseFeed();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        next();
        pauseFeed();
      });
    }

    // Visibility observer
    if ('IntersectionObserver' in window) {
      var section = feed.closest('.page') || feed;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            inView = true;
            resetFeed();
            startTimer();
          } else {
            inView = false;
            stopTimer();
          }
        });
      }, { threshold: 0.3 });
      obs.observe(section);
    }

    // Wheel event gating — scroll down/up still navigates slides
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
          pauseFeed();
        }
      }, { passive: false });
    }

    // Touch/swipe — horizontal swipe navigates slides
    var touchStartY = 0;
    var touchStartX = 0;

    feed.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    feed.addEventListener('touchend', function (e) {
      var deltaY = touchStartY - e.changedTouches[0].clientY;
      var deltaX = touchStartX - e.changedTouches[0].clientX;

      // Accept both horizontal and vertical swipes for slide navigation
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        // Horizontal swipe
        if (deltaX > 0) {
          next();
        } else {
          prev();
        }
        pauseFeed();
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 40) {
        // Vertical swipe still navigates slides (for scroll-like feel)
        if (deltaY > 0) {
          next();
        } else {
          prev();
        }
        pauseFeed();
      }
    }, { passive: true });

    // Resize handler — recalculate fixed heights
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measureAndSet();
        // Reposition track without animation
        var offset = getOffset(current);
        track.style.transition = 'none';
        track.style.transform = 'translateX(-' + offset + '%)';
        void track.offsetHeight;
        track.style.transition = '';
      }, 150);
    });

    // Initialize — defer to ensure flex layout is computed
    requestAnimationFrame(function () {
      measureAndSet();
    });

    // ResizeObserver fallback — ensures heights stay correct
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        var h = feed.clientHeight;
        if (h > 0 && h !== feedHeight) {
          feedHeight = h;
          for (var i = 0; i < blocks.length; i++) {
            blocks[i].style.height = h + 'px';
          }
          var offset = getOffset(current);
          track.style.transition = 'none';
          track.style.transform = 'translateX(-' + offset + '%)';
          void track.offsetHeight;
          track.style.transition = '';
        }
      });
      ro.observe(feed);
    }

    // Expose API for scroll.js integration
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
