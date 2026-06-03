/**
 * Swarna Shree — Supabase Image Seeder
 * Uploads all local product images to Supabase Storage
 * and updates the image_url on each product row.
 *
 * Run once locally:
 *   node supabase/seed-images.js --email admin@yourdomain.com --password yourpassword
 *
 * You must first create an admin user in:
 *   Supabase Dashboard → Authentication → Users → Add user
 */
'use strict';

const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const env = loadEnvLocal();
const SUPABASE_URL      = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const BUCKET            = 'Swarna Shree';
const ASSETS_DIR        = path.join(__dirname, '..', 'assets', 'products');

// Parse --email and --password from CLI args
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf('--' + name);
  return idx !== -1 ? args[idx + 1] : null;
};
const EMAIL    = getArg('email');
const PASSWORD = getArg('password');

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node supabase/seed-images.js --email admin@example.com --password yourpassword');
  process.exit(1);
}

// Image file → product row index mapping
// Based on sequential order in PHOTOS13.pdf (p01-p27) + PHOTOH SHOOT 222.pdf (p28,p33,p36-p46)
// Row index matches the INSERT order in schema.sql (1-indexed)
const IMAGE_MAP = {
  'p01.jpeg': 1,  'p02.jpeg': 2,  'p03.jpeg': 3,  'p04.jpeg': 4,
  'p05.jpeg': 5,  'p06.jpeg': 6,  'p07.jpeg': 7,  'p08.jpeg': 8,
  'p09.jpeg': 9,  'p10.jpeg': 10, 'p11.jpeg': 11, 'p12.jpeg': 12,
  'p13.jpeg': 13, 'p14.jpeg': 14, 'p15.jpeg': 15, 'p16.jpeg': 16,
  'p17.jpeg': 17, 'p18.jpeg': 18, 'p19.jpeg': 19, 'p20.jpeg': 20,
  'p21.jpeg': 21, 'p22.jpeg': 22, 'p23.jpeg': 23, 'p24.jpeg': 24,
  'p25.jpeg': 25, 'p26.jpeg': 26, 'p27.jpeg': 27, 'p28.jpeg': 28,
  'p33.jpeg': 29, 'p36.jpeg': 30, 'p37.jpeg': 31, 'p38.jpeg': 32,
  'p39.jpeg': 33, 'p40.jpeg': 34, 'p41.jpeg': 35, 'p42.jpeg': 36,
  'p43.jpeg': 37, 'p44.jpeg': 38, 'p45.jpeg': 39, 'p46.jpeg': 40,
};

async function run() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Sign in as admin
  console.log('Signing in as', EMAIL, '...');
  const { error: authErr } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (authErr) { console.error('Auth failed:', authErr.message); process.exit(1); }
  console.log('✓ Signed in\n');

  // 2. Fetch all product IDs in insertion order
  const { data: products, error: fetchErr } = await supabase
    .from('products')
    .select('id, name')
    .order('id', { ascending: true });
  if (fetchErr) { console.error('Fetch error:', fetchErr.message); process.exit(1); }
  console.log(`Found ${products.length} products in database\n`);

  // 3. Upload hero image
  await uploadAndUpdate(supabase, 'hero.jpeg', null, products);

  // 4. Upload product images + update DB rows
  for (const [filename, rowIndex] of Object.entries(IMAGE_MAP)) {
    await uploadAndUpdate(supabase, filename, rowIndex, products);
  }

  // 5. Update collection images (use first product image from each collection)
  await seedCollectionImages(supabase, products);

  console.log('\n✅ All done! Images uploaded and database updated.');
}

async function uploadAndUpdate(supabase, filename, rowIndex, products) {
  const localPath = path.join(ASSETS_DIR, filename);
  if (!fs.existsSync(localPath)) {
    console.log(`  skip ${filename} (not found locally)`);
    return;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const contentType = 'image/jpeg';

  // Upload to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileBuffer, { contentType, upsert: true });

  if (uploadErr) {
    console.error(`  ✗ upload ${filename}:`, uploadErr.message);
    return;
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;

  // Update product row if this is a product image
  if (rowIndex !== null) {
    const product = products[rowIndex - 1];
    if (!product) { console.log(`  ✗ no product at row ${rowIndex}`); return; }

    const { error: updateErr } = await supabase
      .from('products')
      .update({ image_url: publicUrl })
      .eq('id', product.id);

    if (updateErr) {
      console.error(`  ✗ update product ${product.id}:`, updateErr.message);
    } else {
      console.log(`  ✓ ${filename} → product #${product.id} (${product.name})`);
    }
  } else {
    console.log(`  ✓ ${filename} uploaded (hero banner)`);
  }
}

async function seedCollectionImages(supabase, products) {
  console.log('\nUpdating collection cover images...');
  const { data: collections } = await supabase.from('collections').select('id, name').order('display_order');
  if (!collections) return;

  for (const col of collections) {
    // Find first product in this collection that has an image
    const { data: colProds } = await supabase
      .from('products')
      .select('id, image_url')
      .eq('collection', col.name)
      .neq('image_url', '')
      .limit(1);

    if (colProds && colProds.length > 0) {
      await supabase.from('collections').update({ image_url: colProds[0].image_url }).eq('id', col.id);
      console.log(`  ✓ ${col.name} → ${colProds[0].image_url.split('/').pop()}`);
    }
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
