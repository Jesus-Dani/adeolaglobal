-- Design pass: em-dashes read as AI-generated house style, removed from all
-- site copy. This is the one instance that had already been seeded into live
-- data (supabase/migrations/20260816220100_seed_categories_and_products.sql)
-- — everywhere else was fixed directly in component/page source.

update public.products
set description = 'A handmade crochet tote, woven with care. A versatile everyday bag with a boutique finish.'
where slug = 'handmade-crochet-tote-bag';
