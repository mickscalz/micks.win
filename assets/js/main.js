/* ============================================================================
   micks.win — boot shims.
   ========================================================================== */
(function (w, d) {
  'use strict';
  if(w.Cabinet&&w.Cabinet.playing){w.MusicLab.mount();w.NurseryUI.mount();}

  /* one visible failure is better than a silent black screen */
  var fatal = d.getElementById('fatal');
  w.addEventListener('error', function (e) {
    console.error('[micks.win]', e.message, e.filename, e.lineno);
  });
  w.addEventListener('unhandledrejection', function (e) {
    console.error('[micks.win] promise', e.reason);
  });

  /* if the engine never came up, say so plainly */
  setTimeout(function () {
    if (!w.Cabinet || !w.Cabinet.playing) return;
    if (fatal && !fatal.hidden) return;
  }, 2500);

  /* the canvas should never lose the context to a stray drag-select */
  d.addEventListener('dragstart', function (e) { e.preventDefault(); });
  d.addEventListener('contextmenu', function (e) {
    if (e.target && e.target.tagName === 'CANVAS') e.preventDefault();
  });

  /* a world is only as good as the pixels it gets: nudge the browser to keep
     compositing the canvas on its own layer */
  var st = d.getElementById('stage');
  if (st) st.style.willChange = 'transform';
})(window, document);
