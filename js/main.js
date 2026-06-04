/* ════════════════════════════════════════════════════
   Zinzuwadia Jewellers — main.js
   ════════════════════════════════════════════════════ */
'use strict';

/* ── AOS ─────────────────────────────────────────── */
AOS.init({ duration: 680, once: true, offset: 55, easing: 'ease-out-cubic' });

/* ── ANNOUNCEMENT BAR DISMISS ────────────────────── */
const annBar  = document.getElementById('announcementBar');
const annClose = document.getElementById('annClose');

function dismissAnnBar() {
  annBar.classList.add('is-hidden');
  document.documentElement.style.setProperty('--ann-h', '0px');
  sessionStorage.setItem('ann-closed', '1');
}

if (sessionStorage.getItem('ann-closed')) {
  annBar.classList.add('is-hidden');
  document.documentElement.style.setProperty('--ann-h', '0px');
}

annClose?.addEventListener('click', dismissAnnBar);

/* ── HEADER SCROLL (transparent over hero, solid on scroll) ─── */
const header = document.getElementById('site-header');
function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 60);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ════════════════════════════════════════════════════
   SIDE MENU (Messika-style left drawer)
   ════════════════════════════════════════════════════ */
const hamburger  = document.getElementById('hamburger');
const sideMenu   = document.getElementById('sideMenu');
const backdrop   = document.getElementById('sideMenuBackdrop');
const closeBtn   = document.getElementById('sideMenuClose');

function openSideMenu() {
  sideMenu.classList.add('is-open');
  backdrop.classList.add('is-open');
  sideMenu.setAttribute('aria-hidden', 'false');
  hamburger.classList.add('is-open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeSideMenu() {
  sideMenu.classList.remove('is-open');
  backdrop.classList.remove('is-open');
  sideMenu.setAttribute('aria-hidden', 'true');
  hamburger.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openSideMenu);
closeBtn.addEventListener('click', closeSideMenu);
backdrop.addEventListener('click', closeSideMenu);

// Close when any nav link clicked
sideMenu.querySelectorAll('[data-close]').forEach(el =>
  el.addEventListener('click', closeSideMenu)
);

// Appointment from side menu
document.getElementById('openAppointmentSideMenu')?.addEventListener('click', () => {
  closeSideMenu();
  setTimeout(() => openAppointmentModal(), 80);
});

/* ════════════════════════════════════════════════════
   HERO SWIPER
   ════════════════════════════════════════════════════ */
function initHeroSwiper() {
  if (window._heroSwiper) { window._heroSwiper.destroy(true, true); }

  window._heroSwiper = new Swiper('#heroSwiper', {
    loop: true,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 1000,
    autoplay: { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: '.hero-pagination', clickable: true },
    navigation: { prevEl: '.hero-prev', nextEl: '.hero-next' },
    keyboard: { enabled: true },
  });
}

// Exposed so data-loader can call it after injecting slides
window.initHeroSwiper = initHeroSwiper;

// Init on load (uses fallback slides from HTML)
document.addEventListener('DOMContentLoaded', initHeroSwiper);

/* ════════════════════════════════════════════════════
   SEARCH OVERLAY
   ════════════════════════════════════════════════════ */
const searchOverlay = document.getElementById('searchOverlay');
const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function openSearch() {
  searchOverlay.classList.add('is-open');
  searchOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => searchInput.focus(), 80);
}
function closeSearch() {
  searchOverlay.classList.remove('is-open');
  searchOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  searchInput.value = '';
  searchResults.innerHTML = '';
}

document.getElementById('searchToggle')?.addEventListener('click', openSearch);
document.getElementById('searchClose').addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });

searchInput.addEventListener('input', debounce(e => {
  const q = e.target.value.trim().toLowerCase();
  searchResults.innerHTML = '';
  if (q.length < 2) return;
  const hits = (window.SWARNA_SHREE_PRODUCTS || [])
    .filter(p => [p.name, p.collection, p.category].some(f => f?.toLowerCase().includes(q)))
    .slice(0, 6);
  if (!hits.length) {
    searchResults.innerHTML = `<p style="font-size:13px;color:var(--text-light)">No results for "${q}"</p>`;
    return;
  }
  hits.forEach(p => {
    const d = document.createElement('div');
    d.className = 'search-result-item';
    d.innerHTML = `
      <div style="width:42px;height:42px;background:var(--cream);border-radius:4px;flex-shrink:0"></div>
      <div><span>${p.name}</span><br/><small>${p.collection} · ${p.category}</small></div>
      <div style="margin-left:auto;font-size:12px;color:var(--rouge)">${p.price}</div>`;
    d.addEventListener('click', () => { closeSearch(); openAppointmentModal(p.name); });
    searchResults.appendChild(d);
  });
}, 220));

/* ════════════════════════════════════════════════════
   APPOINTMENT MODAL
   ════════════════════════════════════════════════════ */
const modal         = document.getElementById('appointmentModal');
const modalForm     = document.getElementById('modalFormInner');
const modalSuccess  = document.getElementById('modalSuccess');
const apptForm      = document.getElementById('appointmentForm');

function openAppointmentModal(context = '') {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('appt-name')?.focus(), 150);
}

function closeAppointmentModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  // Reset success state
  setTimeout(() => {
    modalForm.style.display = '';
    modalSuccess.setAttribute('hidden', '');
  }, 350);
}

// Wire all triggers
['openAppointmentHeader', 'openAppointmentCTA', 'heroJoinScheme'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => openAppointmentModal());
});
modal.addEventListener('click', e => { if (e.target === modal) closeAppointmentModal(); });
document.getElementById('closeAppointmentModal').addEventListener('click', closeAppointmentModal);

// Form submit
apptForm.addEventListener('submit', e => {
  e.preventDefault();
  const name  = document.getElementById('appt-name').value.trim();
  const phone = document.getElementById('appt-phone').value.trim();
  if (!name || !phone) {
    highlightErrors([!name && 'appt-name', !phone && 'appt-phone'].filter(Boolean));
    return;
  }
  modalForm.style.display = 'none';
  modalSuccess.removeAttribute('hidden');
  apptForm.reset();
});

function highlightErrors(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = 'var(--rouge)';
    el.style.animation = 'shake .38s ease';
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      el.style.animation = '';
    }, { once: true });
  });
}

// Inject shake keyframe once
const ks = document.createElement('style');
ks.textContent='@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}';
document.head.appendChild(ks);

// Expose globally
window.openAppointmentModal  = openAppointmentModal;
window.closeAppointmentModal = closeAppointmentModal;

/* ════════════════════════════════════════════════════
   PRODUCT FILTER
   ════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
  btn.classList.add('active');
  btn.setAttribute('aria-selected','true');
  const f = btn.dataset.filter;
  document.querySelectorAll('.product-card').forEach(c => {
    const hide = f !== 'all' && c.dataset.category !== f;
    c.classList.toggle('hidden', hide);
    // Ensure AOS doesn't keep newly-visible cards invisible
    if (!hide) c.classList.add('aos-animate');
  });
});

// Footer jewellery links → scroll to products + apply category filter
document.addEventListener('click', e => {
  const link = e.target.closest('[data-footer-cat]');
  if (!link) return;
  e.preventDefault();
  const cat = link.dataset.footerCat;
  if (window.showHomePage) window.showHomePage();
  requestAnimationFrame(() => {
    const fb = document.querySelector(`.filter-btn[data-filter="${CSS.escape(cat)}"]`)
      || document.querySelector(`.filter-btn[data-filter="${cat}"]`);
    if (fb) {
      fb.click();
    } else {
      document.querySelectorAll('.filter-btn').forEach(b => {
        const active = b.dataset.filter === cat;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('.product-card').forEach(c => {
        const hide = c.dataset.category !== cat;
        c.classList.toggle('hidden', hide);
        if (!hide) c.classList.add('aos-animate');
      });
    }
    document.getElementById('jewellery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Category strip → trigger filter
document.querySelectorAll('.category-item[data-filter]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const fb = document.querySelector(`.filter-btn[data-filter="${item.dataset.filter}"]`);
    if (fb) fb.click();
    document.getElementById('jewellery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ════════════════════════════════════════════════════
   NEWSLETTER
   ════════════════════════════════════════════════════ */
window.handleNewsletterSubmit = e => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn   = e.target.querySelector('button');
  if (!input.value.trim()) return;
  const orig = btn.textContent;
  btn.textContent = '✓'; btn.disabled = true; input.value = '';
  input.placeholder = 'Thank you!';
  setTimeout(() => { btn.textContent = orig; btn.disabled = false; input.placeholder = 'Your email address'; }, 4000);
};

/* ════════════════════════════════════════════════════
   SMOOTH SCROLL
   ════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    // When an inner page is active the section is inside hidden #mainContent;
    // let the router handle navigation back to the home page + scroll instead.
    const mainContent = document.getElementById('mainContent');
    if (mainContent && mainContent.hidden && mainContent.contains(t)) return;
    e.preventDefault();
    const offset = t.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr-h')) + 8);
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

/* ════════════════════════════════════════════════════
   KEYBOARD
   ════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('active'))         closeAppointmentModal();
  if (searchOverlay.classList.contains('is-open')) closeSearch();
  if (sideMenu.classList.contains('is-open'))      closeSideMenu();
});

/* ── UTIL ────────────────────────────────────────── */
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
