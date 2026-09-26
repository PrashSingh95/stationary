-- Demo data for client walkthroughs.
-- Safe to run multiple times.

delete from payments
where order_id in (
  select id from orders
  where user_id in (select id from users where email in ('demo.customer@bpb.local', 'admin@bpb.local'))
);

delete from orders
where user_id in (select id from users where email in ('demo.customer@bpb.local', 'admin@bpb.local'));

delete from addresses
where user_id in (select id from users where email in ('demo.customer@bpb.local', 'admin@bpb.local'));

delete from users
where email in ('demo.customer@bpb.local', 'admin@bpb.local');

insert into users (name, email, password_hash, role) values
  ('Demo Customer', 'demo.customer@bpb.local', crypt('demo1234', gen_salt('bf')), 'customer'),
  ('Store Admin', 'admin@bpb.local', crypt('admin1234', gen_salt('bf')), 'admin');

insert into products (id, name, slug, description, category_slug, brand, price, original_price, images, specs, stock_quantity, is_featured, is_popular) values
  ('p-013', 'Blue Ball Pen Pack', 'blue-ball-pen-pack', 'A value pack of smooth blue ball pens for daily school and office writing.', 'pens-pencils', 'Cello', 40, 50, array['pen'], array['Pack of 5', 'Blue ink', 'Smooth writing'], 75, true, true),
  ('p-014', 'Premium Fountain Pen', 'premium-fountain-pen', 'A polished fountain pen for signatures, gifting, and premium writing.', 'pens-pencils', 'Pierre Cardin', 350, 425, array['pen'], array['Fine nib', 'Gift box', 'Refillable cartridge'], 12, false, true),
  ('p-015', 'A5 Pocket Notebook', 'a5-pocket-notebook', 'Compact notebook for quick notes, homework reminders, and daily planning.', 'notebooks', 'Paperkraft', 75, 95, array['notebook'], array['A5 size', '120 pages', 'Soft cover'], 48, true, false),
  ('p-016', 'Hardbound Practical Record', 'hardbound-practical-record', 'Sturdy record book for lab work, practical files, and school submissions.', 'notebooks', 'Navneet', 180, 220, array['register'], array['Hardbound', '192 pages', 'Ruled format'], 30, false, true),
  ('p-017', 'Watercolor Cake Set', 'watercolor-cake-set', 'Bright watercolor cakes for school art, posters, and craft projects.', 'art-craft', 'Camlin', 160, 199, array['colors'], array['12 colors', 'Brush included', 'Washable'], 26, true, true),
  ('p-018', 'Chart Paper Bundle', 'chart-paper-bundle', 'Assorted chart papers for school projects, notices, and presentation work.', 'art-craft', 'Generic', 60, 75, array['folder'], array['10 sheets', 'Assorted colors', 'Project ready'], 44, false, false),
  ('p-019', 'Box File A4', 'box-file-a4', 'Durable A4 box file for invoices, assignments, and office documents.', 'files-folders', 'Solo', 110, 135, array['folder'], array['A4 size', 'Lever arch', 'Spine label'], 34, true, false),
  ('p-020', 'Executive Desk Organizer', 'executive-desk-organizer', 'A compact organizer for pens, clips, notes, and desk essentials.', 'office-supplies', 'Kangaro', 240, 299, array['sticky'], array['Multi-compartment', 'Desk use', 'Matte finish'], 15, false, true),
  ('p-021', 'Scientific Calculator', 'scientific-calculator', 'Student scientific calculator for mathematics, science, and exam preparation.', 'school-supplies', 'Casio', 650, 750, array['exam'], array['252 functions', 'Exam friendly', 'Battery powered'], 9, true, true),
  ('p-022', 'Compass and Divider Set', 'compass-divider-set', 'Precision compass and divider set for geometry practice and diagrams.', 'geometry-supplies', 'Camlin', 95, 120, array['geometry'], array['Compass', 'Divider', 'Lead box'], 28, false, false),
  ('p-023', 'A4 Lamination Service', 'a4-lamination-service', 'Clear A4 lamination service for certificates, ID copies, and documents.', 'printing-services', 'In-store', 30, null, array['print'], array['A4 size', 'Gloss finish', 'Same-day service'], 500, true, false),
  ('p-024', 'Color Photocopy A4', 'color-photocopy-a4', 'Quick A4 color photocopy service for notes, forms, and school documents.', 'printing-services', 'In-store', 12, null, array['print'], array['A4 size', 'Color copy', 'Walk-in service'], 1000, false, true)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  category_slug = excluded.category_slug,
  brand = excluded.brand,
  price = excluded.price,
  original_price = excluded.original_price,
  images = excluded.images,
  specs = excluded.specs,
  stock_quantity = excluded.stock_quantity,
  is_featured = excluded.is_featured,
  is_popular = excluded.is_popular,
  is_active = true,
  updated_at = now();

with demo_user as (
  select id from users where email = 'demo.customer@bpb.local'
), first_address as (
  insert into addresses (user_id, recipient_name, phone, line1, line2, city, state, postal_code, is_default)
  select id, 'Demo Customer', '9876543210', '12 Market Road', 'Near City School', 'Pune', 'Maharashtra', '411001', true
  from demo_user
  returning id, user_id
), second_address as (
  insert into addresses (user_id, recipient_name, phone, line1, line2, city, state, postal_code, is_default)
  select id, 'Demo Customer', '9876543210', '42 Office Lane', 'Station Road', 'Pune', 'Maharashtra', '411002', false
  from demo_user
  returning id, user_id
), confirmed_order as (
  insert into orders (user_id, address_id, status, payment_method, payment_status, total_amount, created_at)
  select user_id, id, 'CONFIRMED', 'COD', 'PENDING', 415, now() - interval '1 day'
  from first_address
  returning id
), packed_order as (
  insert into orders (user_id, address_id, status, payment_method, payment_status, total_amount, created_at)
  select user_id, id, 'PACKED', 'ONLINE', 'PAID', 880, now() - interval '3 days'
  from second_address
  returning id
), delivered_order as (
  insert into orders (user_id, address_id, status, payment_method, payment_status, total_amount, created_at)
  select user_id, id, 'DELIVERED', 'COD', 'PENDING', 290, now() - interval '10 days'
  from first_address
  returning id
)
insert into order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
select id, 'p-001', 'Classmate Spiral Notebook', 120, 2, 240 from confirmed_order
union all
select id, 'p-013', 'Blue Ball Pen Pack', 40, 2, 80 from confirmed_order
union all
select id, 'p-003', 'Camlin Color Pencil Set', 95, 1, 95 from confirmed_order
union all
select id, 'p-021', 'Scientific Calculator', 650, 1, 650 from packed_order
union all
select id, 'p-019', 'Box File A4', 110, 1, 110 from packed_order
union all
select id, 'p-023', 'A4 Lamination Service', 30, 4, 120 from packed_order
union all
select id, 'p-010', 'Long Register Notebook', 140, 1, 140 from delivered_order
union all
select id, 'p-011', 'Binder Clips Pack', 45, 2, 90 from delivered_order
union all
select id, 'p-024', 'Color Photocopy A4', 12, 5, 60 from delivered_order;

insert into payments (order_id, provider, provider_payment_id, status, amount)
select id, 'COD', null, 'PENDING', 415 from orders where total_amount = 415 and user_id = (select id from users where email = 'demo.customer@bpb.local')
union all
select id, 'RAZORPAY_SANDBOX', 'pay_demo_001', 'PAID', 880 from orders where total_amount = 880 and user_id = (select id from users where email = 'demo.customer@bpb.local')
union all
select id, 'COD', null, 'PENDING', 290 from orders where total_amount = 290 and user_id = (select id from users where email = 'demo.customer@bpb.local');
