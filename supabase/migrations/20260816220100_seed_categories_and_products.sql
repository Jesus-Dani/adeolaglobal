-- Seed data: the 8 launch categories (PRD.md s3.1) and the 3 seed products
-- referenced in PRD.md s6 ("beyond the 3 seed items"). Real photography only
-- exists for the hair growth oil (cropped from a real staged photo); the
-- other two use generated placeholder images — see scripts/generate-placeholder-image.mjs
-- and README.md "Brand assets".

insert into public.categories (name, slug, sort_order) values
  ('Hair-care', 'hair-care', 1),
  ('Skincare', 'skincare', 2),
  ('Home-care', 'home-care', 3),
  ('Crochet Accessories', 'crochet-accessories', 4),
  ('Handmade Crafts', 'handmade-crafts', 5),
  ('Gift Boxes', 'gift-boxes', 6),
  ('Resin Products', 'resin-products', 7),
  ('Digital Products', 'digital-products', 8);

with new_product as (
  insert into public.products (category_id, name, slug, description, base_price, images, status, is_bestseller)
  select id, 'Rosemary Hair Growth Oil 100ml', 'rosemary-hair-growth-oil-100ml',
    'A rosemary-infused hair growth oil formulated to strengthen roots and nourish the scalp. Made with care in Nigeria.',
    8500.00, array['/images/products/rosemary-hair-growth-oil.jpg'], 'active', true
  from public.categories where slug = 'hair-care'
  returning id
)
insert into public.product_variants (product_id, size, sku, stock_count)
select id, '100ml', 'ADG-HGO-100', 25 from new_product;

with new_product as (
  insert into public.products (category_id, name, slug, description, base_price, images, status)
  select id, 'Glow Face Serum 30ml', 'glow-face-serum-30ml',
    'A lightweight daily serum formulated to brighten and even out skin tone.',
    7000.00, array['/images/products/glow-face-serum.jpg'], 'active'
  from public.categories where slug = 'skincare'
  returning id
)
insert into public.product_variants (product_id, size, sku, stock_count)
select id, '30ml', 'ADG-GFS-30', 20 from new_product;

with new_product as (
  insert into public.products (category_id, name, slug, description, base_price, images, status, is_new)
  select id, 'Handmade Crochet Tote Bag', 'handmade-crochet-tote-bag',
    'A handmade crochet tote, woven with care — a versatile everyday bag with a boutique finish.',
    15000.00, array['/images/products/handmade-crochet-tote-bag.jpg'], 'active', true
  from public.categories where slug = 'crochet-accessories'
  returning id
)
insert into public.product_variants (product_id, colour, sku, stock_count)
select id, 'Lilac', 'ADG-CTB-LIL', 10 from new_product;
