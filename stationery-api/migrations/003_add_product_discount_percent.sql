alter table products
  add column if not exists discount_percent integer not null default 0;

alter table products
  drop constraint if exists products_discount_percent_check;

alter table products
  add constraint products_discount_percent_check
  check (discount_percent >= 0 and discount_percent <= 100);
