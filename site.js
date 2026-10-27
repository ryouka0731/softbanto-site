// 番頭の画面 (Web アプリ) のリンク。空のあいだは「番頭を開く」ボタンを出さない。
// 例: const BANTO_URL = 'https://script.google.com/macros/s/xxxx/exec';
const BANTO_URL = '';

(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // 「番頭を開く」
  document.querySelectorAll('[data-banto-link]').forEach(function (a) {
    if (!BANTO_URL) return;
    a.href = BANTO_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.hidden = false;
  });

  // スクロールで節がふわっと入る
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    slides.forEach(function (s, i) {
      if (i === 0) return; // ヒーローは最初から見せる
      s.classList.add('reveal');
      io.observe(s);
    });
  }

  // ---------- プレゼンモード ----------
  var body = document.body;
  var toggle = document.querySelector('[data-present-toggle]');
  var ui = document.querySelector('[data-deck-ui]');
  var pageEl = document.querySelector('[data-deck-page]');
  var current = 0;
  var presenting = false;

  toggle.hidden = false;

  function show(i) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, k) {
      var on = k === current;
      s.classList.toggle('is-current', on);
      if (on) { s.removeAttribute('aria-hidden'); s.scrollTop = 0; }
      else s.setAttribute('aria-hidden', 'true');
    });
    pageEl.textContent = (current + 1) + ' / ' + slides.length;
    history.replaceState(null, '', '#slide-' + (current + 1));
  }

  function enter(i) {
    presenting = true;
    body.classList.add('presenting');
    ui.hidden = false;
    toggle.setAttribute('aria-pressed', 'true');
    show(typeof i === 'number' ? i : nearestSlide());
  }

  function exit() {
    if (!presenting) return;
    presenting = false;
    body.classList.remove('presenting');
    ui.hidden = true;
    toggle.setAttribute('aria-pressed', 'false');
    slides.forEach(function (s) { s.classList.remove('is-current'); s.removeAttribute('aria-hidden'); });
    history.replaceState(null, '', location.pathname + location.search);
    var target = slides[current];
    target.classList.add('is-in');
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    toggle.focus();
  }

  // いま画面にいちばん近い節から始める
  function nearestSlide() {
    var best = 0, bestDist = Infinity;
    slides.forEach(function (s, k) {
      var d = Math.abs(s.getBoundingClientRect().top - 60);
      if (d < bestDist) { bestDist = d; best = k; }
    });
    return best;
  }

  function slideFromHash() {
    var m = /^#slide-(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1], 10) - 1 : -1;
  }

  toggle.addEventListener('click', function () { presenting ? exit() : enter(); });
  document.querySelector('[data-deck-prev]').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
  document.querySelector('[data-deck-next]').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
  document.querySelector('[data-deck-exit]').addEventListener('click', function (e) { e.stopPropagation(); exit(); });

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (!presenting) {
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); enter(); }
      return;
    }
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter':
        if (e.key === 'Enter' && tag === 'button') return;
        e.preventDefault(); show(current + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        e.preventDefault(); show(current - 1); break;
      case 'Home': e.preventDefault(); show(0); break;
      case 'End': e.preventDefault(); show(slides.length - 1); break;
      case 'Escape': case 'p': case 'P': e.preventDefault(); exit(); break;
    }
  });

  // 頁をクリックで進む (リンクやボタンは除く)。左の端 1/4 は戻る。
  document.addEventListener('click', function (e) {
    if (!presenting) return;
    if (e.target.closest('a, button, summary, input')) return;
    if (!e.target.closest('[data-slide]')) return;
    if (e.clientX < window.innerWidth / 4) show(current - 1);
    else show(current + 1);
  });

  // #slide-3 のような URL で途中から開く
  var start = slideFromHash();
  if (start >= 0) enter(start);
  window.addEventListener('hashchange', function () {
    var i = slideFromHash();
    if (i >= 0) { presenting ? show(i) : enter(i); }
  });
})();
