create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  description text not null,
  color text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  category_slug text not null references categories(slug),
  brand text not null,
  price integer not null check (price >= 0),
  original_price integer check (original_price is null or original_price >= price),
  images text[] not null default '{}',
  specs text[] not null default '{}',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_featured boolean not null default false,
  is_popular boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_id text not null references products(id),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  address_id uuid references addresses(id),
  status text not null default 'PENDING' check (status in ('PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
  payment_method text not null default 'COD',
  payment_status text not null default 'PENDING',
  total_amount integer not null check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null references products(id),
  product_name text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  subtotal integer not null check (subtotal >= 0)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  status text not null default 'PENDING',
  amount integer not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into categories (slug, name, description, color, display_order) values
  ('pens-pencils', 'Pens & Pencils', 'Ball pens, gel pens, pencils, erasers, and everyday writing tools.', 'bg-teal-100 text-teal-900', 1),
  ('notebooks', 'Notebooks', 'School notebooks, registers, spiral pads, and practical writing books.', 'bg-rose-100 text-rose-900', 2),
  ('school-supplies', 'School Supplies', 'Daily classroom essentials for students, parents, and teachers.', 'bg-sky-100 text-sky-900', 3),
  ('office-supplies', 'Office Supplies', 'Files, clips, sticky notes, markers, diaries, and desk basics.', 'bg-zinc-100 text-zinc-900', 4),
  ('art-craft', 'Art & Craft', 'Colors, brushes, craft paper, glue, scissors, and creative materials.', 'bg-amber-100 text-amber-950', 5),
  ('files-folders', 'Files & Folders', 'Document files, clear folders, report covers, and project storage.', 'bg-indigo-100 text-indigo-950', 6),
  ('geometry-supplies', 'Geometry Supplies', 'Geometry boxes, rulers, compasses, protractors, and exam tools.', 'bg-emerald-100 text-emerald-950', 7),
  ('printing-services', 'Printing Services', 'Quick black-and-white prints, color prints, photocopy, and lamination.', 'bg-orange-100 text-orange-950', 8)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  color = excluded.color,
  display_order = excluded.display_order;

insert into products (id, name, slug, description, category_slug, brand, price, original_price, images, specs, stock_quantity, is_featured, is_popular) values
  ('p-001', 'Classmate Spiral Notebook', 'classmate-spiral-notebook', 'A durable ruled notebook for school notes, tuition work, and office planning.', 'notebooks', 'Classmate', 120, 150, array['notebook'], array['200 pages', 'Ruled pages', 'Spiral bound', 'A4 size'], 24, true, true),
  ('p-002', 'Reynolds Trimax Gel Pen', 'reynolds-trimax-gel-pen', 'Smooth writing gel pen with a comfortable grip for daily writing and exams.', 'pens-pencils', 'Reynolds', 60, 75, array['pen'], array['Blue ink', '0.7 mm tip', 'Refillable', 'Exam friendly'], 60, true, true),
  ('p-003', 'Camlin Color Pencil Set', 'camlin-color-pencil-set', 'Bright color pencils for school projects, drawing books, and creative practice.', 'art-craft', 'Camlin', 95, 120, array['colors'], array['12 shades', 'Break-resistant leads', 'Smooth color laydown'], 35, true, false),
  ('p-004', 'Apsara Drawing Pencil Pack', 'apsara-drawing-pencil-pack', 'Reliable graphite pencils for writing, sketching, and classroom use.', 'pens-pencils', 'Apsara', 50, null, array['pencil'], array['Pack of 10', 'Dark graphite', 'Easy sharpening'], 50, false, true),
  ('p-005', 'Office Sticky Notes Cube', 'office-sticky-notes-cube', 'Colorful sticky notes for reminders, labels, bookmarks, and quick lists.', 'office-supplies', 'Paperline', 85, 100, array['sticky'], array['5 colors', '400 sheets', 'Strong adhesive'], 22, false, true),
  ('p-006', 'Transparent Project File', 'transparent-project-file', 'Neat document file for reports, assignments, bills, and presentation papers.', 'files-folders', 'Solo', 35, null, array['folder'], array['A4 compatible', '20 pockets', 'Clear cover'], 40, true, false),
  ('p-007', 'Maped Geometry Box', 'maped-geometry-box', 'Complete geometry kit for mathematics classes, exams, and project diagrams.', 'geometry-supplies', 'Maped', 180, 220, array['geometry'], array['Compass', 'Divider', 'Ruler', 'Set squares', 'Protractor'], 16, false, false),
  ('p-008', 'A4 Color Print', 'a4-color-print', 'Sharp A4 color printing for assignments, forms, images, and office documents.', 'printing-services', 'In-store', 15, null, array['print'], array['A4 size', 'Color print', 'Same-day service'], 1000, true, false),
  ('p-009', 'Fevicol Craft Glue', 'fevicol-craft-glue', 'Multipurpose glue for school crafts, paper models, charts, and home projects.', 'art-craft', 'Fevicol', 30, null, array['glue'], array['50 g bottle', 'Clean nozzle', 'Paper and craft use'], 0, false, false),
  ('p-010', 'Long Register Notebook', 'long-register-notebook', 'Sturdy long notebook for accounts, practical records, and subject notes.', 'notebooks', 'Navneet', 140, 165, array['register'], array['288 pages', 'Single line', 'Hard cover'], 25, false, true),
  ('p-011', 'Binder Clips Pack', 'binder-clips-pack', 'Strong binder clips for organizing notes, office papers, and invoices.', 'office-supplies', 'Kangaro', 45, null, array['clips'], array['Pack of 12', 'Assorted sizes', 'Reusable metal clips'], 32, false, false),
  ('p-012', 'Student Exam Kit', 'student-exam-kit', 'A ready-to-carry exam essentials kit with pens, pencil, eraser, ruler, and pouch.', 'school-supplies', 'SmartKit', 199, 240, array['exam'], array['2 pens', '2 pencils', 'Eraser', 'Sharpener', '15 cm ruler', 'Pouch'], 18, true, true)
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
  updated_at = now();
