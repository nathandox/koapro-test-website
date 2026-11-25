// Site header: mega-menu open/close, preview swapping, and mobile sub-menus.
(function () {
  var nav = document.getElementById('main-nav');
  if (!nav) return;
  var items = nav.querySelectorAll('.koa-item[data-menu]');
  var closeTimer;

  function closeAll(except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.classList.remove('open');
      var b = it.querySelector('.koa-top');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  function open(it) {
    clearTimeout(closeTimer);
    closeAll(it);
    it.classList.add('open');
    it.querySelector('.koa-top').setAttribute('aria-expanded', 'true');
    it.querySelectorAll('img[data-src]').forEach(function (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); });
  }

  items.forEach(function (it) {
    var btn = it.querySelector('.koa-top');
    it.addEventListener('mouseenter', function () { open(it); });
    it.addEventListener('mouseleave', function () { closeTimer = setTimeout(function () { it.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 160); });
    btn.addEventListener('click', function (e) { e.preventDefault(); it.classList.contains('open') ? closeAll() : open(it); });

    var preview = it.querySelector('.koa-preview');
    if (!preview) return;
    var img = preview.querySelector('img'), title = preview.querySelector('strong'), cta = preview.querySelector('em');
    it.querySelectorAll('.koa-link').forEach(function (link) {
      function show() {
        it.querySelectorAll('.koa-link').forEach(function (l) { l.classList.toggle('active', l === link); });
        var src = link.getAttribute('data-img');
        if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
        title.textContent = link.querySelector('b').textContent;
        cta.textContent = 'Explore ' + link.querySelector('b').textContent.toLowerCase() + ' →';
        preview.setAttribute('href', link.getAttribute('href'));
      }
      link.addEventListener('mouseenter', show);
      link.addEventListener('focus', show);
    });
  });

  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // mobile sub-menus
  nav.querySelectorAll('[data-koa-sub]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = btn.nextElementSibling, s = btn.querySelector('svg'), isOpen = d.style.display === 'flex';
      d.style.display = isOpen ? 'none' : 'flex';
      if (s) s.style.transform = isOpen ? '' : 'rotate(180deg)';
    });
  });
})();
