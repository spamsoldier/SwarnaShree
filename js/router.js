/* ═══════════════════════════════════════════════════════════
   Zinzuwadia Jewellers — router.js
   Hash-based SPA router
   Routes:
     #collection/:id  → Collection detail page
     #product/:id     → Product detail page
     anything else    → Home page (or section scroll)
   ═══════════════════════════════════════════════════════════ */
'use strict';

const ROUTER_GRADIENTS = [
  'linear-gradient(160deg,#1C1C24 0%,#2D2C38 100%)',
  'linear-gradient(160deg,#2D2C38 0%,#1C1C24 100%)',
  'linear-gradient(160deg,#1C1C24 0%,#3A2A1A 100%)',
  'linear-gradient(160deg,#28201A 0%,#1C1C24 100%)',
];

/* ── Exposed globals ─────────────────────────────────────── */

/** Called by data-loader.js after all data is available. */
window.initRouter = function () {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // handle whatever hash is in the URL right now
};

/** Navigate to a hash route. */
window.navigate = function (hash) {
  hash = hash || '';
  const current = window.location.hash.replace(/^#/, '');
  if (current === hash) {
    handleRoute(); // force re-render (hash didn't change, no event fires)
  } else {
    window.location.hash = hash;
  }
};

/** Show the home page — exposed so logo + breadcrumbs can call it. */
window.showHomePage = showHomePage;

/* ── Route dispatcher ────────────────────────────────────── */
function handleRoute() {
  const raw   = window.location.hash.replace(/^#/, '');
  const slash = raw.indexOf('/');
  const type  = slash >= 0 ? raw.slice(0, slash) : raw;
  const id    = slash >= 0 ? raw.slice(slash + 1) : '';

  if (type === 'collection' && id) {
    showCollectionPage(id);
  } else if (type === 'privacy-policy') {
    showPrivacyPage();
  } else if (type === 'our-story') {
    showOurStoryPage();
  } else {
    showHomePage();
    // If it looks like a home-page section anchor (#collections, #jewellery, …)
    // scroll to it after the DOM is restored
    if (type) {
      setTimeout(() => {
        const el = document.getElementById(type);
        if (el) {
          const hdrH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr-h')) || 68;
          const annH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ann-h')) || 34;
          const top  = el.getBoundingClientRect().top + window.scrollY - hdrH - annH - 8;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 60);
    }
  }
}

/* ── Home page ───────────────────────────────────────────── */
function showHomePage() {
  const main  = document.getElementById('mainContent');
  const inner = document.getElementById('innerPage');

  if (inner && !inner.hidden) {
    inner.hidden = true;
    inner.innerHTML = '';
  }
  if (main) main.hidden = false;
}

/* ── Collection page ─────────────────────────────────────── */
function showCollectionPage(id) {
  const cols  = window.SWARNA_SHREE_COLLECTIONS || [];
  const prods = window.SWARNA_SHREE_PRODUCTS   || [];

  const col = cols.find(c => String(c.id) === String(id));
  if (!col) { showHomePage(); return; }

  const colProds = prods.filter(p => p.collection === col.name);
  const colIdx   = cols.indexOf(col);
  const gradient = ROUTER_GRADIENTS[colIdx % ROUTER_GRADIENTS.length];

  const html = `
    <nav class="inner-breadcrumb" aria-label="Breadcrumb">
      <a href="#" class="bc-link" onclick="event.preventDefault();window.navigate('')">Home</a>
      <span class="bc-sep">›</span>
      <span class="bc-current">${rEsc(col.name)}</span>
    </nav>

    <div class="coll-page-hero" style="background:${gradient}">
      <div class="hero-pattern-overlay"></div>
      <div class="coll-page-hero-content">
        <p class="hero-eyebrow">${rEsc(col.tagline || '')}</p>
        <h1 class="coll-page-title">${rEsc(col.name)}</h1>
        <p class="coll-page-desc">${rEsc(col.description || '')}</p>
        <button class="btn-hero-primary" onclick="window.openAppointmentModal('${rAttr(col.name)}')">
          Book an Appointment
        </button>
      </div>
    </div>

    <div class="coll-page-products">
      <div class="section-header" style="margin-bottom:44px">
        <p class="eyebrow">${colProds.length} ${colProds.length === 1 ? 'Piece' : 'Pieces'}</p>
        <h2 class="section-title">${rEsc(col.name)}</h2>
      </div>
      ${colProds.length > 0
        ? `<div class="products-grid coll-products-grid">
             ${colProds.map((p, i) => buildProductCardHTML(p, i, cols)).join('')}
           </div>`
        : `<p class="coll-empty-notice">No pieces currently displayed — book an appointment to explore the full collection.</p>`
      }
      <div class="section-cta" style="margin-top:56px">
        <button class="btn-primary-lg" onclick="window.openAppointmentModal('${rAttr(col.name)}')">
          Book to View Full Collection
        </button>
      </div>
    </div>
  `;

  renderInnerPage(html);
}

/* ── Render helper ───────────────────────────────────────── */
function renderInnerPage(html) {
  const main  = document.getElementById('mainContent');
  const inner = document.getElementById('innerPage');
  if (!inner) return;

  if (main)  main.hidden  = true;
  inner.hidden = false;
  inner.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'instant' });
  inner.classList.remove('page-enter');
  void inner.offsetWidth; // force reflow so animation restarts
  inner.classList.add('page-enter');
  if (typeof AOS !== 'undefined') AOS.refresh();
}

/* ── Product card HTML builder (for inner pages) ─────────── */
function buildProductCardHTML(product, index, cols) {
  const isNew    = product.new_arrival === 'true' || product.new_arrival === true;
  const imgUrl   = product.image_url || product.image || '';
  const hasBg    = !!imgUrl;
  const colIdx   = (cols || []).findIndex(c => c.name === product.collection);
  const gradient = ROUTER_GRADIENTS[Math.max(0, colIdx) % ROUTER_GRADIENTS.length];

  return `
    <div class="product-card"
         data-category="${rEsc(product.category || '')}"
         data-collection="${rEsc(product.collection || '')}">
      <div class="product-card-image">
        ${isNew ? '<span class="product-badge badge-new">New</span>' : ''}
        ${hasBg
          ? `<img src="${rEsc(imgUrl)}" alt="${rEsc(product.name)}" loading="lazy" />`
          : `<div class="product-placeholder">
               <div class="product-placeholder-inner">
                 <img src="logo.png" alt="" />
                 <span>${rEsc(product.category || 'Jewellery')}</span>
               </div>
             </div>`
        }
        <div class="product-card-cta">
          <button class="btn-appt-card"
                  onclick="window.openAppointmentModal('${rAttr(product.name)}')">
            Book Appointment
          </button>
        </div>
      </div>
      <div class="product-card-info">
        <p class="product-coll-label">${rEsc(product.collection || '')}</p>
        <h3 class="product-name">${rEsc(product.name)}</h3>
        ${product.description ? `<p class="product-desc">${rEsc(product.description)}</p>` : ''}
      </div>
    </div>
  `;
}

/* ── Our Story page ──────────────────────────────────────── */
function showOurStoryPage() {
  const html = `
    <nav class="inner-breadcrumb" aria-label="Breadcrumb">
      <a href="#" class="bc-link" onclick="event.preventDefault();window.navigate('')">Home</a>
      <span class="bc-sep">›</span>
      <span class="bc-current">Our Story</span>
    </nav>

    <div class="our-story-page">
      <div class="our-story-hero">
        <img src="logo.png" alt="" class="our-story-crest" />
        <h1 class="our-story-title">The Story of<br /><em>Zinzuwadia</em></h1>
      </div>

      <div class="our-story-body">
        <p>We began as hands that crafted for others. Today, we craft for the ones who matter most — the brides, the families, the generations yet to come.</p>
        <p>For over five decades, Zinzuwadia has stood for something simple yet rare: jewellery that feels like it has always belonged to you.</p>
        <p>From the quiet corners of Ahmedabad to the hearts of those who wear it, every piece carries the same promise — that beauty, when made with care, becomes a legacy.</p>
        <p>This is not just jewellery. This is the story we continue to write, together.</p>
      </div>

      <div class="our-story-cta">
        <button class="btn-primary-lg" onclick="window.openAppointmentModal()">Book an Appointment</button>
      </div>
    </div>
  `;
  renderInnerPage(html);
}

/* ── Privacy Policy page ─────────────────────────────────── */
function showPrivacyPage() {
  const html = `
    <nav class="inner-breadcrumb" aria-label="Breadcrumb">
      <a href="#" class="bc-link" onclick="event.preventDefault();window.navigate('')">Home</a>
      <span class="bc-sep">›</span>
      <span class="bc-current">Privacy Policy</span>
    </nav>

    <div class="privacy-page">
      <div class="privacy-hero">
        <p class="eyebrow">Legal</p>
        <h1 class="privacy-title">Privacy Policy</h1>
        <p class="privacy-updated">Last updated: April 2025</p>
      </div>

      <div class="privacy-body">

        <section class="privacy-section">
          <h2>1. Who We Are</h2>
          <p>Zinzuwadia Jewellers ("we", "us", "our") operates this website. For any privacy-related questions, contact us at <a href="mailto:info@zinzuwadiajewellers.com">info@zinzuwadiajewellers.com</a> or <a href="tel:+919999999999">+91 99999 99999</a>.</p>
        </section>

        <section class="privacy-section">
          <h2>2. Information We Collect</h2>
          <p>We collect information you voluntarily provide when you:</p>
          <ul>
            <li>Book an appointment (name and phone number)</li>
            <li>Contact us via email or phone</li>
            <li>Subscribe to updates</li>
          </ul>
          <p>We do not collect payment information, passwords, or sensitive personal data through this website.</p>
        </section>

        <section class="privacy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul>
            <li>Confirm and manage your appointment</li>
            <li>Respond to your enquiries</li>
            <li>Send you updates about new collections or events (only if you have opted in)</li>
          </ul>
          <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </section>

        <section class="privacy-section">
          <h2>4. Data Retention</h2>
          <p>We retain your contact information only for as long as necessary to fulfil the purpose for which it was collected, or as required by applicable law. Appointment records are typically retained for up to 12 months.</p>
        </section>

        <section class="privacy-section">
          <h2>5. Cookies</h2>
          <p>This website uses only essential technical cookies required for basic functionality. We do not use advertising or tracking cookies. No cookie consent is required as we do not place non-essential cookies.</p>
        </section>

        <section class="privacy-section">
          <h2>6. Third-Party Services</h2>
          <p>Our website uses the following third-party services:</p>
          <ul>
            <li><strong>Supabase</strong> — secure database and storage hosting (EU/US servers)</li>
            <li><strong>Google Fonts</strong> — web font loading</li>
            <li><strong>Vercel</strong> — website hosting and delivery</li>
          </ul>
          <p>Each service operates under its own privacy policy. We encourage you to review their policies.</p>
        </section>

        <section class="privacy-section">
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>To exercise any of these rights, please email us at <a href="mailto:info@zinzuwadiajewellers.com">info@zinzuwadiajewellers.com</a>.</p>
        </section>

        <section class="privacy-section">
          <h2>8. Security</h2>
          <p>We take reasonable technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse. However, no internet transmission is completely secure.</p>
        </section>

        <section class="privacy-section">
          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect any changes. Continued use of the website after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section class="privacy-section">
          <h2>10. Contact</h2>
          <p>For any questions about this Privacy Policy or how we handle your data, please contact:</p>
          <p><strong>Zinzuwadia Jewellers</strong><br />
          Phone: <a href="tel:+919999999999">+91 99999 99999</a><br />
          Email: <a href="mailto:info@zinzuwadiajewellers.com">info@zinzuwadiajewellers.com</a></p>
        </section>

      </div>
    </div>
  `;
  renderInnerPage(html);
}

/* ── Utils ───────────────────────────────────────────────── */
function rEsc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function rAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
