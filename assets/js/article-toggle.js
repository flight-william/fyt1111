// Article toggle — collapse/expand extended content on section pages
(function () {
  if (!document.documentElement.classList.contains('is-section-page')) return;

  const ext = document.querySelector('.article-extended');
  const hint = document.querySelector('.article-toggle-hint');
  if (!ext || !hint) return;

  function toggle() {
    const collapsing = !ext.classList.contains('collapsed');
    if (collapsing) {
      // Set explicit max-height from current size, then collapse
      ext.style.maxHeight = ext.scrollHeight + 'px';
      // Force reflow
      ext.offsetHeight; // eslint-disable-line no-unused-expressions
      ext.classList.add('collapsed');
      hint.classList.add('collapsed');
      ext.style.maxHeight = '0';
    } else {
      ext.classList.remove('collapsed');
      hint.classList.remove('collapsed');
      ext.style.maxHeight = ext.scrollHeight + 'px';
      // Clear inline max-height after transition completes
      ext.addEventListener('transitionend', function clear() {
        ext.style.maxHeight = '';
        ext.removeEventListener('transitionend', clear);
      });
    }
  }

  // Clicking the section heading link toggles
  const headingLink = document.querySelector('.page .heading-display a');
  if (headingLink) {
    headingLink.addEventListener('click', function (e) {
      e.preventDefault();
      toggle();
    });
  }

  // Clicking the chevron hint toggles
  hint.addEventListener('click', toggle);
})();
