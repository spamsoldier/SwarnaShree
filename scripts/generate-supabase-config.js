'use strict';

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const outPath = path.join(__dirname, '..', 'js', 'supabase-config.js');

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

if (!fs.existsSync(envPath) && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing .env.local — copy .env.example and fill in your Supabase credentials.');
  process.exit(1);
}

const env = fs.existsSync(envPath) ? parseEnv(fs.readFileSync(envPath, 'utf8')) : {};
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local or Vercel env vars.');
  process.exit(1);
}

const output = `/* Auto-generated from .env.local — do not edit by hand */
window.SUPABASE_URL = ${JSON.stringify(url)};
window.SUPABASE_PUBLISHABLE_KEY = ${JSON.stringify(key)};
`;

fs.writeFileSync(outPath, output, 'utf8');
console.log('Wrote js/supabase-config.js');
