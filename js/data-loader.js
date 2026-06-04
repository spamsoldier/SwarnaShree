/* ═══════════════════════════════════════════════════════════
   Zinzuwadia Jewellers — data-loader.js
   Loads products & collections from Supabase.
   Falls back to embedded demo data if Supabase is unavailable.
   ═══════════════════════════════════════════════════════════ */
'use strict';

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_KEY = window.SUPABASE_PUBLISHABLE_KEY;

/* ─── FALLBACK DATA (used if Supabase unreachable) ── */
const FALLBACK_PRODUCTS = [
  { id:1,  name:'Sankhla',            collection:'Rajsi',   category:'Payal',     description:'Traditional silver ankle chain handcrafted in the Jaipur atelier.',         image_url:'assets/products/p01.jpeg', featured:true,  new_arrival:true  },
  { id:2,  name:'Antique Necklace',   collection:'Rajsi',   category:'Necklaces', description:'Heavy antique-finish silver necklace from the workshops of Jaipur.',        image_url:'assets/products/p02.jpeg', featured:true,  new_arrival:true  },
  { id:6,  name:'Cuban Chain',        collection:'Veera',   category:'Necklaces', description:'Italian-inspired Cuban link chain in sterling silver.',                      image_url:'assets/products/p06.jpeg', featured:true,  new_arrival:true  },
  { id:7,  name:'Full Kandora',       collection:'Jhilmil', category:'Payal',     description:'Full waist kandora in tribal silver from Rajkot.',                          image_url:'assets/products/p07.jpeg', featured:true,  new_arrival:true  },
  { id:11, name:'Fancy Necklace',     collection:'Glamour', category:'Necklaces', description:'Floral-motif fancy necklace in silver with Italian design sensibility.',     image_url:'assets/products/p11.jpeg', featured:true,  new_arrival:true  },
  { id:17, name:'Punjabi Kada',       collection:'Veera',   category:'Kadas',     description:'Solid Punjabi men\'s kada in sterling silver.',                             image_url:'assets/products/p17.jpeg', featured:true,  new_arrival:true  },
];

const FALLBACK_COLLECTIONS = [
  { id:1, name:'Rajsi',   tagline:'Rooted in Rajasthan',      description:'Traditional silver jewellery from the ateliers of Jaipur, Udaipur and Kutchh.', image_url:'assets/products/p02.jpeg', display_order:1 },
  { id:2, name:'Jhilmil', tagline:'Tribal Spirit of Gujarat', description:'Handcrafted in the tribal traditions of Rajkot and Kutch.',                     image_url:'assets/products/p07.jpeg', display_order:2 },
  { id:3, name:'Veera',   tagline:'Contemporary Silver',      description:'Casting-technique jewellery inspired by Italian silhouettes, made in Mumbai.',  image_url:'assets/products/p06.jpeg', display_order:3 },
  { id:4, name:'Glamour', tagline:'Modern Classics',          description:'CZ and stone-set designs in sterling silver.',                                   image_url:'assets/products/p11.jpeg', display_order:4 },
];

const COLLECTION_GRADIENTS = [
  'linear-gradient(135deg,#88051E 0%,#620100 100%)',
  'linear-gradient(135deg,#2c0a0e 0%,#620100 60%,#191311 100%)',
  'linear-gradient(135deg,#191311 0%,#3a0a0d 50%,#88051E 100%)',
  'linear-gradient(135deg,#620100 0%,#88051E 100%)',
];

/* ─── MAIN INIT ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [products, collections, settings] = await Promise.all([
      sbFetch('products', '*', 'id'),
      sbFetch('collections', '*', 'display_order'),
      sbFetch('settings', '*', 'key'),
    ]);
    applySettings(settings);
    initWithData(products, collections, settings);
  } catch (err) {
    console.warn('[Zinzuwadia Jewellers] Supabase load failed, using fallback.', err);
    initWithData(FALLBACK_PRODUCTS, FALLBACK_COLLECTIONS, []);
  }
});

/* ─── APPLY SETTINGS ────────────────────────────── */
function applySettings(settings) {
  if (!settings || !settings.length) return;
  const get = (key) => (settings.find(s => s.key === key) || {}).value || '';

  // Hero banner — desktop
  const heroUrl = get('hero_image_url');
  if (heroUrl) {
    const heroBgDesktop = document.getElementById('heroBgDesktop');
    if (heroBgDesktop) heroBgDesktop.style.backgroundImage = `url('${heroUrl}')`;
  }

  // Hero banner — mobile (always set; falls back to desktop url if no mobile-specific one saved)
  const heroMobileUrl = get('hero_mobile_url');
  const heroBgMobile = document.getElementById('heroBgMobile');
  if (heroBgMobile) {
    const mobileUrl = heroMobileUrl || heroUrl;
    if (mobileUrl) heroBgMobile.style.backgroundImage = `url('${mobileUrl}')`;
    // If neither Supabase key is set the inline fallback in HTML stays as-is
  }

  // Editorial image
  const editorialUrl = get('editorial_image_url');
  if (editorialUrl) {
    const editorialImg = document.querySelector('.editorial-bg-img');
    if (editorialImg) editorialImg.src = editorialUrl;
  }

  // Banner text — only apply if the key exists in settings
  // Values are stored as HTML (bold/italic/br supported); empty string = hide
  const hasKey = (key) => settings.some(s => s.key === key);
  if (hasKey('hero_eyebrow'))  { const el = document.getElementById('heroEyebrow');  if (el) el.innerHTML = get('hero_eyebrow'); }
  if (hasKey('hero_title'))    { const el = document.getElementById('heroTitle');    if (el) el.innerHTML = get('hero_title'); }
  if (hasKey('hero_subtitle')) { const el = document.getElementById('heroSubtitle'); if (el) el.innerHTML = get('hero_subtitle'); }

  // WhatsApp floating button
  const phone = get('phone');
  if (phone) {
    const wa = document.getElementById('whatsappFloat');
    if (wa) {
      const digits = phone.replace(/\D/g, '');
      wa.href = `https://wa.me/${digits}`;
    }
  }

  // Filter bar categories
  const catsRaw = get('categories');
  const cats = catsRaw ? (() => { try { return JSON.parse(catsRaw); } catch(e) { return null; } })() : null;
  const filterBar = document.getElementById('filterBar');
  if (filterBar && cats && cats.length) {
    filterBar.querySelectorAll('.filter-btn:not([data-filter="all"])').forEach(b => b.remove());
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = cat;
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected','false');
      btn.textContent = cat;
      filterBar.appendChild(btn);
    });
  }
}

/* ─── Supabase fetch helper ─────────────────────── */
async function sbFetch(table, select, order) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&order=${order}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
    }
  });
  if (!res.ok) throw new Error(`Supabase ${table} fetch failed: ${res.status}`);
  return res.json();
}

/* ─── INIT ──────────────────────────────────────── */
function initWithData(products, collections, settings) {
  window.SWARNA_SHREE_PRODUCTS    = products;
  window.SWARNA_SHREE_COLLECTIONS = collections;
  renderCollections(collections);
  renderProducts(products);
  renderFooter(collections, products, settings);
  if (typeof window.initRouter === 'function') window.initRouter();
}

/* ─── FOOTER (synced with admin) ────────────────── */
const DEFAULT_FOOTER_CATS = ['Necklaces', 'Payal', 'Kadas', 'Rings', 'Bracelets'];

function getFooterCategories(settings, products) {
  if (settings && settings.length) {
    const row = settings.find(s => s.key === 'categories');
    if (row && row.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (e) { /* ignore */ }
    }
  }
  const fromProducts = [...new Set((products || []).map(p => p.category).filter(Boolean))].sort();
  if (fromProducts.length) return fromProducts;
  return DEFAULT_FOOTER_CATS;
}

function renderFooter(collections, products, settings) {
  const collList = document.getElementById('footerCollectionsList');
  const jewList  = document.getElementById('footerJewelleryList');
  if (!collList && !jewList) return;

  if (collList) {
    const sorted = [...(collections || [])].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    if (!sorted.length) {
      collList.innerHTML = '<li><span style="opacity:.4;font-size:13px">No collections yet</span></li>';
    } else {
      collList.innerHTML = sorted.map(col =>
        `<li><a href="#collection/${col.id}">${escHtml(col.name)}</a></li>`
      ).join('');
    }
  }

  if (jewList) {
    const cats = getFooterCategories(settings, products);
    jewList.innerHTML = cats.map(cat =>
      `<li><a href="#jewellery" data-footer-cat="${escAttr(cat)}">${escHtml(cat)}</a></li>`
    ).join('');
  }
}

/* ─── RENDER COLLECTIONS ────────────────────────── */
function renderCollections(collections) {
  if (!collections || !collections.length) return;
  const grid = document.getElementById('collectionsGrid');
  if (!grid) return;

  const sorted = [...collections].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  grid.innerHTML = '';

  sorted.forEach((col, i) => {
    const article = document.createElement('article');
    article.className = 'collection-card';
    article.setAttribute('data-aos', 'fade-up');
    article.setAttribute('data-aos-delay', i * 100);
    article.style.cursor = 'pointer';
    article.addEventListener('click', () => { if (window.navigate) window.navigate('collection/' + col.id); });

    const imgUrl   = col.image_url || '';
    const gradient = COLLECTION_GRADIENTS[i % COLLECTION_GRADIENTS.length];
    article.innerHTML = `
      <div class="collection-card-image">
        ${imgUrl
          ? `<img src="${escHtml(imgUrl)}" alt="${escHtml(col.name)}" loading="lazy" />`
          : `<div class="coll-placeholder" style="background:${gradient}"></div>`}
        <div class="collection-card-overlay">
          <span class="coll-label">${escHtml(col.name)}</span>
          <p class="coll-tagline">${escHtml(col.tagline || '')}</p>
        </div>
      </div>`;
    grid.appendChild(article);
  });

  if (typeof AOS !== 'undefined') AOS.refresh();
}

/* ─── RENDER PRODUCTS ───────────────────────────── */
function renderProducts(products) {
  if (!products || !products.length) return;
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const visible = products.slice(0, 12);
  visible.forEach((p, i) => grid.appendChild(createProductCard(p, i)));

  // "Explore More" CTA — only if there are more than 12 products
  if (products.length > 12) {
    const existingCta = document.getElementById('productsExploreCta');
    if (!existingCta) {
      const cta = document.createElement('div');
      cta.id = 'productsExploreCta';
      cta.className = 'section-cta';
      cta.style.marginTop = '48px';
      cta.innerHTML = `<button class="btn-primary-lg" onclick="window.navigate('collections')">Explore All Collections</button>`;
      grid.parentElement.appendChild(cta);
    }
  }

  if (typeof AOS !== 'undefined') AOS.refresh();
}

function createProductCard(product, index) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category   = product.category   || '';
  card.dataset.collection = product.collection || '';
  card.setAttribute('data-aos', 'fade-up');
  card.setAttribute('data-aos-delay', Math.min((index % 4) * 80, 240));

  const isNew = product.new_arrival === true || product.new_arrival === 'true';
  const imgUrl = product.image_url || product.image || '';

  card.innerHTML = `
    <div class="product-card-image">
      ${isNew ? '<span class="product-badge badge-new">New</span>' : ''}
      ${imgUrl
        ? `<img src="${escHtml(imgUrl)}" alt="${escHtml(product.name)}" loading="lazy" />`
        : `<div class="product-placeholder">
             <div class="product-placeholder-inner">
               <img src="assets/logo/logo-mark.png" alt="" />
               <span>${escHtml(product.category || 'Jewellery')}</span>
             </div>
           </div>`}
      <div class="product-card-cta">
        <button class="btn-appt-card" onclick="window.openAppointmentModal('${escAttr(product.name)}')">
          Book Appointment
        </button>
      </div>
    </div>
    <div class="product-card-info">
      <p class="product-coll-label">${escHtml(product.collection || '')}</p>
      <h3 class="product-name">${escHtml(product.name)}</h3>
      ${product.description ? `<p class="product-desc">${escHtml(product.description)}</p>` : ''}
    </div>`;
  return card;
}

/* ─── UTILS ─────────────────────────────────────── */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function escAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
