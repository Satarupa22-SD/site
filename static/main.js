/* Privateer docs: theme, drawer, search, TOC scroll spy. No dependencies. */
(function () {
  'use strict';

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  function applyTheme(mode) {
    root.classList.toggle('dark', mode === 'dark');
    try { localStorage.setItem('pvtr-theme', mode); } catch (e) {}
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('pvtr-theme'); } catch (e) {}
    if (saved) { applyTheme(saved); return; }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
  })();
  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    applyTheme(root.classList.contains('dark') ? 'light' : 'dark');
  });

  /* ---------- Mobile drawer ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var backdrop = document.querySelector('.drawer-backdrop');
  function closeDrawer() { document.body.classList.remove('drawer-open'); }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    document.body.classList.toggle('drawer-open');
  });
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  /* ---------- Search ---------- */
  var overlay = document.querySelector('.search-overlay');
  var input = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var index = null;
  var selected = -1;

  function openSearch() {
    document.body.classList.add('search-open');
    if (input) { input.value = ''; input.focus(); }
    render([]);
    if (!index) {
      if (window.__PVTR_SEARCH_INDEX__) { index = window.__PVTR_SEARCH_INDEX__; }
      else { fetch(document.querySelector('link[rel=stylesheet]').href.replace('style.css','')+'../index.json')
        .then(function(r){return r.json()}).then(function(d){index=d}).catch(function(){index=[]}); }
    }
  }
  function closeSearch() { document.body.classList.remove('search-open'); selected = -1; }

  document.querySelectorAll('[data-search-open]').forEach(function (el) {
    el.addEventListener('click', openSearch);
  });
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeSearch();
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') { closeSearch(); closeDrawer(); }
    if (!document.body.classList.contains('search-open')) return;
    var links = resultsEl ? resultsEl.querySelectorAll('a') : [];
    if (e.key === 'ArrowDown') { e.preventDefault(); selected = Math.min(selected + 1, links.length - 1); highlight(links); }
    if (e.key === 'ArrowUp') { e.preventDefault(); selected = Math.max(selected - 1, 0); highlight(links); }
    if (e.key === 'Enter' && selected >= 0 && links[selected]) { window.location = links[selected].href; }
  });
  function highlight(links) {
    links.forEach(function (l, i) { l.classList.toggle('selected', i === selected); });
    if (links[selected]) links[selected].scrollIntoView({ block: 'nearest' });
  }

  function search(q) {
    if (!index || !q) return [];
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return index.map(function (doc) {
      var hay = (doc.title + ' ' + doc.group + ' ' + doc.body).toLowerCase();
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        if (hay.indexOf(terms[i]) === -1) return null;
        score += doc.title.toLowerCase().indexOf(terms[i]) !== -1 ? 5 : 1;
      }
      return { doc: doc, score: score };
    }).filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8).map(function (r) { return r.doc; });
  }
  function snippet(doc, q) {
    var i = doc.body.toLowerCase().indexOf(q.toLowerCase().split(/\s+/)[0] || '');
    if (i < 0) return doc.body.slice(0, 130);
    var start = Math.max(0, i - 40);
    return (start > 0 ? '\u2026' : '') + doc.body.slice(start, start + 150) + '\u2026';
  }
  function render(hits, q) {
    if (!resultsEl) return;
    selected = -1;
    if (!q) { resultsEl.innerHTML = '<div class="search-empty">Type to search the docs\u2026</div>'; return; }
    if (!hits.length) { resultsEl.innerHTML = '<div class="search-empty">No results for \u201c' + escapeHtml(q) + '\u201d</div>'; return; }
    resultsEl.innerHTML = hits.map(function (d) {
      return '<a href="' + d.url + '"><div class="r-group">' + escapeHtml(d.group) + '</div>' +
        '<div class="r-title">' + escapeHtml(d.title) + '</div>' +
        '<div class="r-snippet">' + escapeHtml(snippet(d, q)) + '</div></a>';
    }).join('');
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  if (input) input.addEventListener('input', function () {
    render(search(input.value.trim()), input.value.trim());
  });

  /* ---------- TOC scroll spy ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (tocLinks.length) {
    var headings = tocLinks.map(function (a) {
      return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    }).filter(Boolean);
    var spy = function () {
      var pos = window.scrollY + 110;
      var current = headings[0];
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].offsetTop <= pos) current = headings[i];
      }
      tocLinks.forEach(function (a) {
        a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
      });
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }
})();
