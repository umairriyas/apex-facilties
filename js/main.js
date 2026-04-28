/* ============================================================
   APEX FACILITIES — main.js
   Covers: nav toggle, scroll header, stat counters,
           scroll reveal, active nav, services sticky nav,
           smooth anchors, back-to-top
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. HAMBURGER MENU TOGGLE ─────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      /* Prevent body scroll when menu is open */
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close menu when a nav link is clicked */
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    /* Close menu when clicking outside */
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  /* ── 2. STICKY HEADER SHADOW ON SCROLL ───────────────── */
  var header = document.querySelector('.header');

  if (header) {
    var onHeaderScroll = function () {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 2px 16px rgba(26,79,138,0.12)';
      } else {
        header.style.boxShadow = '0 1px 8px rgba(26,79,138,0.06)';
      }
    };

    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ── 3. ACTIVE NAV LINK (current page) ───────────────── */
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    var href = (link.getAttribute('href') || '').split('/').pop();
    if (href === currentPath) {
      link.classList.add('active');
    }
  });

  /* ── 4. STAT COUNTER ANIMATION ───────────────────────── */
  function animateCounter(el) {
    var target   = parseFloat(el.dataset.target);
    var suffix   = el.dataset.suffix || '';
    var prefix   = el.dataset.prefix || '';
    var decimals = (el.dataset.decimals || 0) | 0;
    var duration = 1800;
    var start    = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      /* Ease out cubic */
      var ease = 1 - Math.pow(1 - progress, 3);
      var value = ease * target;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* Auto-parse stat cards — reads number + suffix from the DOM */
  function initCounters() {
    document.querySelectorAll('.stat-card h3, .about-stat-card h3, .stats-strip-card h3').forEach(function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';

      var raw    = el.textContent.trim();
      var match  = raw.match(/^([^\d]*)(\d+\.?\d*)(.*)$/);
      if (!match) return;

      el.dataset.prefix  = match[1];
      el.dataset.target  = match[2];
      el.dataset.suffix  = match[3];
      el.dataset.decimals = (match[2].indexOf('.') !== -1) ? match[2].split('.')[1].length : 0;
      el.textContent     = match[1] + '0' + match[3];

      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(el);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.4 });

      observer.observe(el);
    });
  }

  initCounters();

  /* ── 5. SCROLL REVEAL ────────────────────────────────── */
  var revealCSS = document.createElement('style');
  revealCSS.textContent = [
    '[data-reveal] {',
    '  opacity: 0;',
    '  transform: translateY(28px);',
    '  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);',
    '}',
    '[data-reveal].revealed {',
    '  opacity: 1;',
    '  transform: none;',
    '}',
    '[data-reveal-delay="1"] { transition-delay: 0.1s; }',
    '[data-reveal-delay="2"] { transition-delay: 0.2s; }',
    '[data-reveal-delay="3"] { transition-delay: 0.3s; }',
    '[data-reveal-delay="4"] { transition-delay: 0.4s; }',
    '[data-reveal-delay="5"] { transition-delay: 0.5s; }',
    '@media (prefers-reduced-motion: reduce) {',
    '  [data-reveal] { opacity:1 !important; transform:none !important; transition:none !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(revealCSS);

  /* Auto-tag reveal candidates */
  var revealSelectors = [
    '.service-card',
    '.industry-card',
    '.stat-card',
    '.process-card',
    '.testimonial-card',
    '.why-feature',
    '.value-card',
    '.about-stat-card',
    '.team-card',
    '.ind-overview-card',
    '.why-strip-card',
    '.stats-strip-card',
    '.map-info-card',
    '.contact-detail-card'
  ];

  document.querySelectorAll(revealSelectors.join(',')).forEach(function (el, i) {
    el.setAttribute('data-reveal', '');
    /* Stagger siblings within same parent */
    var siblings = Array.from(el.parentElement.children);
    var idx = siblings.indexOf(el);
    if (idx > 0 && idx <= 5) {
      el.setAttribute('data-reveal-delay', String(idx));
    }
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback: show everything */
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  /* ── 6. SMOOTH SCROLL FOR ANCHOR LINKS ──────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── 7. SERVICES PAGE STICKY NAV ACTIVE STATE ────────── */
  var svcNavLinks = document.querySelectorAll('.svc-nav-link');

  if (svcNavLinks.length) {
    var svcSections = [];
    svcNavLinks.forEach(function (link) {
      var id = (link.getAttribute('href') || '').slice(1);
      var section = id ? document.getElementById(id) : null;
      if (section) svcSections.push({ link: link, section: section });
    });

    var onSvcScroll = function () {
      var scrollY   = window.scrollY;
      var headerH   = header ? header.offsetHeight : 72;
      var navH      = 56;
      var threshold = headerH + navH + 40;

      var active = null;
      svcSections.forEach(function (item) {
        var top = item.section.getBoundingClientRect().top + scrollY;
        if (scrollY + threshold >= top) active = item;
      });

      svcNavLinks.forEach(function (l) { l.classList.remove('active'); });
      if (active) active.link.classList.add('active');
    };

    window.addEventListener('scroll', onSvcScroll, { passive: true });
    onSvcScroll();
  }

  /* ── 8. INDUSTRIES PAGE SCROLL SPY ──────────────────── */
  /* Reuses same logic for any page with .ind-nav-link if added */

  /* ── 9. BACK TO TOP BUTTON ───────────────────────────── */
  var btt = document.createElement('button');
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '↑';
  btt.style.cssText = [
    'position:fixed',
    'bottom:1.5rem',
    'right:1.5rem',
    'width:44px',
    'height:44px',
    'border-radius:50%',
    'background:var(--color-primary)',
    'color:#fff',
    'font-size:1.1rem',
    'font-weight:700',
    'display:grid',
    'place-items:center',
    'box-shadow:0 4px 16px rgba(26,79,138,0.35)',
    'opacity:0',
    'visibility:hidden',
    'transition:opacity 0.3s ease,visibility 0.3s ease,transform 0.2s ease',
    'z-index:200',
    'cursor:pointer',
    'border:none'
  ].join(';');

  document.body.appendChild(btt);

  btt.addEventListener('mouseenter', function () { this.style.transform = 'scale(1.1)'; });
  btt.addEventListener('mouseleave', function () { this.style.transform = 'scale(1)'; });
  btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      btt.style.opacity    = '1';
      btt.style.visibility = 'visible';
    } else {
      btt.style.opacity    = '0';
      btt.style.visibility = 'hidden';
    }
  }, { passive: true });

  /* ── 10. FORM FIELD VALIDATION FEEDBACK ─────────────── */
  /* Adds red border + removes it on valid input for all forms */
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var invalid = false;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--color-error, #c0392b)';
          invalid = true;
          /* Scroll first invalid field into view */
          if (!form.dataset.firstInvalid) {
            form.dataset.firstInvalid = '1';
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
          }
        }
      });
      if (invalid) {
        e.preventDefault();
        delete form.dataset.firstInvalid;
      }
    });

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        if (this.value.trim()) {
          this.style.borderColor = '';
        }
      });
    });
  });

  /* ── 11. PHONE LINK — ADD TEL: PREFIX IF MISSING ─────── */
  document.querySelectorAll('a[href*="702"]').forEach(function (a) {
    var h = a.getAttribute('href');
    if (h && !h.startsWith('tel:') && !h.startsWith('http')) {
      a.setAttribute('href', 'tel:' + h.replace(/\D/g, ''));
    }
  });

  /* ── 12. EXTERNAL LINKS — OPEN IN NEW TAB ────────────── */
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    if (!a.hostname || a.hostname !== window.location.hostname) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  /* ── 13. LAZY IMAGE FALLBACK ──────────────────────────── */
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      this.style.background = 'var(--color-surface, #f0f4f9)';
      this.style.minHeight  = this.style.minHeight || '120px';
      this.removeAttribute('src');
    });
  });

  /* ── 14. CURRENT YEAR IN FOOTER ──────────────────────── */
  document.querySelectorAll('.footer-bottom p').forEach(function (p) {
    p.innerHTML = p.innerHTML.replace(/\d{4}/, new Date().getFullYear());
  });

})();