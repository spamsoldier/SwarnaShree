-- ══════════════════════════════════════════════════
-- Zinzuwadia Jewellers — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════

-- ── Tables ──────────────────────────────────────────

create table if not exists public.collections (
  id          serial primary key,
  name        text    not null,
  tagline     text    default '',
  description text    default '',
  image_url   text    default '',
  display_order integer default 0
);

create table if not exists public.products (
  id          serial  primary key,
  name        text    not null,
  collection  text    not null,
  category    text    not null,
  description text    default '',
  image_url   text    default '',
  featured    boolean default false,
  new_arrival boolean default false
);

create table if not exists public.settings (
  key   text primary key,
  value text default ''
);

-- ── Storage bucket ───────────────────────────────────
-- Use existing bucket "swarnashree" (already public in dashboard)
insert into storage.buckets (id, name, public)
values ('swarnashree', 'swarnashree', true)
on conflict (id) do nothing;

-- ── Row Level Security ───────────────────────────────
alter table public.collections enable row level security;
alter table public.products     enable row level security;
alter table public.settings     enable row level security;

-- Public read (website can load products without login)
create policy "public_read_collections" on public.collections
  for select using (true);

create policy "public_read_products" on public.products
  for select using (true);

create policy "public_read_settings" on public.settings
  for select using (true);

-- Authenticated write (admin panel only)
create policy "auth_all_collections" on public.collections
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth_all_products" on public.products
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth_all_settings" on public.settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage policies for your existing "swarnashree" bucket
create policy "public_read_storage" on storage.objects
  for select using (bucket_id = 'swarnashree');

create policy "auth_upload_storage" on storage.objects
  for insert with check (bucket_id = 'swarnashree' and auth.role() = 'authenticated');

create policy "auth_update_storage" on storage.objects
  for update using (bucket_id = 'swarnashree' and auth.role() = 'authenticated');

create policy "auth_delete_storage" on storage.objects
  for delete using (bucket_id = 'swarnashree' and auth.role() = 'authenticated');

-- ── Seed: Collections ────────────────────────────────
insert into public.collections (name, tagline, description, image_url, display_order) values
  ('Rajsi',   'Rooted in Rajasthan',      'Traditional silver jewellery from the ateliers of Jaipur, Udaipur and Kutchh.',          '', 1),
  ('Jhilmil', 'Tribal Spirit of Gujarat', 'Handcrafted in the tribal traditions of Rajkot and Kutch — kandoras, judas and payals.', '', 2),
  ('Veera',   'Contemporary Silver',      'Casting-technique jewellery inspired by Italian silhouettes, made in Mumbai.',            '', 3),
  ('Glamour', 'Modern Classics',          'CZ and stone-set designs in sterling silver for the woman who moves between worlds.',     '', 4)
on conflict do nothing;

-- ── Seed: Settings ───────────────────────────────────
insert into public.settings (key, value) values
  ('cta_text',    'Book an Appointment'),
  ('cta_subtext', 'Visit us at our store'),
  ('address',     'Zinzuwadia, Ahmedabad, Gujarat, India'),
  ('phone',       '+91 99999 99999'),
  ('email',       'info@zinzuwadiajewellers.com'),
  ('hero_eyebrow',  'Zinzuwadia Jewellers Presents'),
  ('hero_title',    'Zinzuwadia <em>Jewellers</em>'),
  ('hero_subtitle', '<span class="hero-tagline">Where Every Instalment Grows Into Gold</span>')
on conflict (key) do nothing;

-- ── Seed: Products ───────────────────────────────────
insert into public.products (name, collection, category, description, image_url, featured, new_arrival) values
  ('Sankhla',             'Rajsi',   'Payal',     'Traditional silver ankle chain handcrafted in the Jaipur atelier.',           '', true,  true),
  ('Antique Necklace',    'Rajsi',   'Necklaces', 'Heavy antique-finish silver necklace from the workshops of Jaipur.',          '', true,  true),
  ('Antique Necklace',    'Rajsi',   'Necklaces', 'Statement piece in oxidised silver with traditional Jaipur motifs.',          '', true,  false),
  ('Antique Sankhla',     'Rajsi',   'Payal',     'Intricately detailed sankhla in antique silver from Jaipur.',                 '', false, false),
  ('Brooch Payal',        'Rajsi',   'Payal',     'Brooch-style payal with traditional Jaipur filigree work.',                   '', false, false),
  ('Cuban Chain',         'Veera',   'Necklaces', 'Italian-inspired Cuban link chain in sterling silver — crafted in Mumbai.',   '', true,  true),
  ('Full Kandora',        'Jhilmil', 'Payal',     'Full waist kandora in tribal silver from Rajkot — bold and ceremonial.',      '', true,  true),
  ('Juda',                'Jhilmil', 'Payal',     'Tribal silver juda pin from Kutch — for the adorned bride.',                  '', false, false),
  ('Cuban Bracelet',      'Veera',   'Bracelets', 'Cuban-link silver bracelet with Italian casting influence.',                   '', true,  false),
  ('Fancy Bangle',        'Glamour', 'Bracelets', 'CZ-set fancy bangle in sterling silver with Thailand-inspired casting.',      '', false, false),
  ('Fancy Necklace',      'Glamour', 'Necklaces', 'Floral-motif fancy necklace in silver with Italian design sensibility.',      '', true,  true),
  ('Chain Bracelet',      'Glamour', 'Bracelets', 'Delicate chain bracelet in sterling silver with CZ detailing.',               '', false, false),
  ('Bridal Antique Payal','Rajsi',   'Payal',     'Bridal-weight antique silver payal — crafted for the forever occasion.',      '', true,  false),
  ('Bridal Antique Payal','Rajsi',   'Payal',     'Heavy bridal sankhla in antique Rajasthani silver.',                          '', false, false),
  ('Stone Ring',          'Glamour', 'Rings',     'CZ cocktail ring in sterling silver — bold and contemporary.',                '', false, true),
  ('Antique Sankhla',     'Rajsi',   'Payal',     'Heavy antique sankhla from Jaipur with intricate hand-engraving.',            '', false, false),
  ('Punjabi Kada',        'Veera',   'Kadas',     'Solid Punjabi men''s kada in sterling silver — a statement of heritage.',     '', true,  true),
  ('Plain Mens Kada',     'Veera',   'Kadas',     'Clean-line men''s kada in hallmarked sterling silver.',                       '', false, false),
  ('Bridal Payal',        'Jhilmil', 'Payal',     'Tribal bridal payal from Rajkot with layered silver links.',                  '', false, false),
  ('Bridal Payal',        'Jhilmil', 'Payal',     'Full-length bridal payal in Jhilmil tribal silver tradition.',                '', true,  false),
  ('Hasli',               'Glamour', 'Necklaces', 'Collar-style hasli in sterling silver with a contemporary finish.',           '', false, true),
  ('Antique Necklace',    'Rajsi',   'Necklaces', 'Traditional Rajasthani antique necklace in sterling silver.',                 '', false, false),
  ('Snake Chain',         'Veera',   'Necklaces', 'Sleek snake chain in sterling silver — versatile and modern.',                '', false, true),
  ('Stone Ring',          'Glamour', 'Rings',     'Statement CZ stone ring in sterling silver.',                                  '', false, false),
  ('Punjabi Kada',        'Veera',   'Kadas',     'Heavy-gauge Punjabi kada in hallmarked sterling silver.',                     '', false, false),
  ('Cuff Mens Kada',      'Rajsi',   'Kadas',     'Cuff-style men''s kada with antique Rajasthani engraving.',                   '', false, false),
  ('Mens Kada',           'Veera',   'Kadas',     'Classic men''s kada in sterling silver with a clean profile.',                '', false, false),
  ('Antique Necklace',    'Rajsi',   'Necklaces', 'Oxidised antique silver necklace — traditional Rajasthani craftsmanship.',    '', false, false),
  ('Antique Necklace',    'Rajsi',   'Necklaces', 'Hand-crafted antique silver necklace from Udaipur.',                          '', false, false),
  ('Antique Juda',        'Rajsi',   'Payal',     'Ornate antique juda in silver from Kutchh.',                                  '', false, false),
  ('Antique Sankhla',     'Rajsi',   'Payal',     'Antique sankhla with detailed filigree from Jaipur.',                         '', false, true),
  ('Cocktail Ring',       'Rajsi',   'Rings',     'Tribal-design cocktail ring in sterling silver.',                             '', false, true),
  ('Cuban Chain',         'Veera',   'Necklaces', 'Heavy-gauge Cuban link chain in sterling silver.',                            '', false, false),
  ('Half Kandora',        'Jhilmil', 'Payal',     'Half-waist kandora in tribal silver from Rajkot.',                            '', true,  true),
  ('Brooch Payal',        'Jhilmil', 'Payal',     'Filigree brooch payal in tribal silver from Rajkot.',                        '', false, false),
  ('Fancy Juda',          'Jhilmil', 'Payal',     'Tribal fancy juda pin in silver from Kutch.',                                 '', false, false),
  ('Fancy Juda',          'Jhilmil', 'Payal',     'Silver fancy juda with intricate tribal detailing from Kutch.',               '', false, false),
  ('Fancy Chain',         'Glamour', 'Necklaces', 'Fancy link chain in sterling silver with contemporary Italian design.',       '', false, false),
  ('Fancy Necklace',      'Glamour', 'Necklaces', 'Floral fancy necklace in sterling silver — Italian inspired.',                '', true,  true),
  ('Fancy Necklace',      'Glamour', 'Necklaces', 'Contemporary silver necklace with decorative motifs.',                        '', false, false)
on conflict do nothing;
