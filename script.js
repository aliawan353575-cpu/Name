(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Navigation: sticky state, mobile menu, scroll lock, active link, progress bar */
  var nav = $('.nav'), links = $('.links'), burger = $('.burger'), bar = $('.progress');
  var hasHero = !!$('.hero3');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('solid', y > 40);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    var hero = $('.hero3 .bg');
    if (hero && !reduce && y < innerHeight) {
      hero.style.setProperty('--py', y * 0.06 + 'px');
      $('.bm').style.setProperty('--my', y * -0.04 + 'px');
    }
  }
  if (!hasHero) nav.classList.add('light');
  function setMenu(open) {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('locked', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', function () { if (innerWidth > 960) setMenu(false); });
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var secs = $$('main section[id]'), navLinks = $$('.links a[href^="#"]');
  if ('IntersectionObserver' in window && secs.length) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) navLinks.forEach(function (a) {
          a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { navIO.observe(s); });
  }

  /* Scroll reveal with stagger */
  var revs = $$('.rev');
  revs.forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 0.08 + 's'); });
  if ('IntersectionObserver' in window && !reduce) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revs.forEach(function (el) { rio.observe(el); });
  } else revs.forEach(function (el) { el.classList.add('in'); });

  /* Portfolio: filter + project modal (event delegation) */
  var grid = $('.works'), dlg = $('#project-dialog');
  if (grid) {
    if ($('.filters')) $('.filters').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      $$('.work', grid).forEach(function (w) {
        w.classList.toggle('hide', b.dataset.filter !== 'all' && w.dataset.cat !== b.dataset.filter);
      });
    });
    grid.addEventListener('click', function (e) {
      var w = e.target.closest('.work'); if (!w) return;
      $('#pd-cat').textContent = w.dataset.label;
      $('#pd-title').textContent = w.dataset.title;
      $('#pd-desc').textContent = w.dataset.desc; var im = $('#pd-img'); im.alt = w.dataset.title + ' concept'; im.onerror = function () { im.onerror = null; im.src = scene(w.dataset.scene); }; im.src = w.dataset.img || scene(w.dataset.scene);
      $('#pd-approach').textContent = w.dataset.approach;
      dlg.showModal(); document.body.classList.add('locked');
    });
    dlg.addEventListener('close', function () { document.body.classList.remove('locked'); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.x')) dlg.close(); });
  }

  /* Before / after slider (pointer drag + keyboard via range input) */
  var ba = $('.ba');
  if (ba) {
    var range = $('input', ba);
    var setPos = function (v) { ba.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', function () { setPos(range.value); });
    setPos(range.value);
  }

  /* FAQ accordion: one open at a time, animated height via grid rows */
  var faq = $('.faq');
  if (faq) faq.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var open = b.getAttribute('aria-expanded') === 'true';
    $$('button', faq).forEach(function (x) {
      x.setAttribute('aria-expanded', 'false');
      document.getElementById(x.getAttribute('aria-controls')).classList.remove('open');
    });
    if (!open) { b.setAttribute('aria-expanded', 'true'); document.getElementById(b.getAttribute('aria-controls')).classList.add('open'); }
  });

  /* Form: validation + success state. No data is sent; connect a backend before launch. */
  var form = $('#inquiry');
  if (form) {
    var rules = { name: 'Enter your name.', company: 'Enter your company name.', email: 'Enter a valid email address.', message: 'Tell us a little about your project.' };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      Object.keys(rules).forEach(function (k) {
        var f = form.elements[k], v = f.value.trim();
        var bad = !v || (k === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
        f.setAttribute('aria-invalid', bad);
        $('#' + k + '-err').textContent = bad ? rules[k] : '';
        if (bad && !first) first = f;
      });
      if (first) { first.focus(); return; }
      var done = $('#form-status');
      form.hidden = true; done.hidden = false; done.focus();
    });
  }

  /* Current year */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* Inline image scenes: used for illustrated slots and as fallback if a remote photo fails */
  function svg(b, d) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs>' + (d || '') + '<radialGradient id="g"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".85"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient></defs>' + b + '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(s);
  }
  function kitchen(wall, cab, top, floor, n) {
    var d = '<linearGradient id="c"><stop offset="0" stop-color="' + cab + '"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + floor + '"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>';
    var b = '<rect width="1600" height="1000" fill="' + wall + '"/><rect x="1080" y="90" width="400" height="430" fill="#fbe9c8"/><path d="M1280 90v430M1080 300h400" stroke="#d9c7a4" stroke-width="8"/>', i, x;
    for (i = 0; i < 5; i++) b += '<rect x="' + (60 + i * 190) + '" y="70" width="180" height="250" fill="url(#c)"/><rect x="' + (60 + i * 200) + '" y="460" width="190" height="300" fill="url(#c)"/>';
    b += '<rect x="40" y="430" width="1040" height="30" fill="' + top + '"/><rect y="760" width="1600" height="240" fill="url(#f)"/><rect x="340" y="680" width="920" height="40" fill="' + top + '"/><rect x="360" y="720" width="880" height="260" fill="url(#c)"/>';
    for (i = 0; i < n; i++) { x = 520 + i * 280; b += '<path d="M' + x + ' 0V230" stroke="#111" stroke-width="3"/><circle cx="' + x + '" cy="300" r="130" fill="url(#g)"/><path d="M' + (x - 45) + ' 270a45 45 0 0 1 90 0z" fill="#1c1a17"/>'; }
    return svg(b, d);
  }
  var scenes = {
    kitchenWarm: function () { return kitchen('#d9cdb8', '#8a6a45', '#f1ece0', '#7a6a55', 3); },
    kitchenDark: function () { return kitchen('#3a3834', '#26241f', '#d8d2c4', '#2b2a27', 3); },
    bath: function () {
      var b = '<rect width="1600" height="1000" fill="#b3ab9b"/>', i;
      for (i = 0; i < 10; i++) b += '<rect x="' + i * 160 + '" width="160" height="720" fill="' + (i % 2 ? '#a39b8c' : '#8f877a') + '" opacity=".6" stroke="#0002"/>';
      return svg(b + '<rect y="720" width="1600" height="280" fill="#6f685d"/><ellipse cx="1180" cy="400" rx="260" ry="360" fill="url(#g)"/><rect x="170" y="620" width="560" height="260" fill="#8a6a45"/><rect x="140" y="560" width="620" height="60" fill="#e9e3d6"/><rect x="220" y="150" width="420" height="340" rx="210" fill="#e8e2d4" stroke="#2b2a27" stroke-width="10"/><ellipse cx="1050" cy="840" rx="400" ry="110" fill="#f7f2e7"/>');
    },
    home: function () {
      var b = '<rect width="1600" height="1000" fill="#d9b08a"/><rect y="760" width="1600" height="240" fill="#2f372c"/><rect x="260" y="360" width="1080" height="420" fill="#d8d0c1"/><rect x="260" y="360" width="520" height="420" fill="#2b2a27"/><polygon points="220,360 800,200 1380,360" fill="#3b3a36"/>';
      [330, 500, 900, 1100].forEach(function (x) { b += '<rect x="' + x + '" y="440" width="120" height="200" fill="#ffd9a0" stroke="#171714" stroke-width="8"/>'; });
      return svg(b);
    },
    before: function () { return svg('<rect width="1600" height="1000" fill="#d8d6c6"/><rect width="1600" height="110" fill="#1b3a8a"/><rect x="60" y="30" width="520" height="40" fill="#ffd400"/><rect x="60" y="150" width="1480" height="60" fill="#8a8a8a"/><rect x="60" y="250" width="700" height="500" fill="#bdbdbd"/><rect x="800" y="250" width="740" height="40" fill="#888"/><rect x="800" y="320" width="740" height="30" fill="#aaa"/><rect x="800" y="440" width="740" height="30" fill="#aaa"/><rect x="800" y="560" width="300" height="60" fill="#c33"/><rect x="60" y="800" width="1480" height="120" fill="#cfc"/>'); },
    after: function () { return svg('<rect width="1600" height="1000" fill="#11110f"/><rect x="60" y="34" width="200" height="22" fill="#f5f1e8"/><rect x="1280" y="26" width="260" height="40" fill="#b18a5a"/><rect x="60" y="150" width="900" height="560" fill="#7a6046"/><rect x="60" y="150" width="300" height="560" fill="#2b2a27"/><rect x="60" y="760" width="620" height="60" fill="#f5f1e8"/><rect x="60" y="840" width="380" height="28" fill="#8a877f"/><rect x="1000" y="150" width="540" height="270" fill="#a39b8c"/><rect x="1000" y="440" width="540" height="270" fill="#c7bfae"/><rect x="60" y="900" width="260" height="60" fill="#b18a5a"/>'); }
  };
  function scene(name) { return (scenes[name] || scenes.kitchenWarm)(); }
  $$('img[data-scene]').forEach(function (im) {
    var fb = function () { im.onerror = null; im.src = scene(im.dataset.scene); };
    if (im.dataset.remote) { im.addEventListener('error', fb); im.src = im.dataset.remote; } else fb();
  });
})();
