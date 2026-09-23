alter table public.job_entries
  add column if not exists quantity integer not null default 1 check (quantity > 0),
  add column if not exists has_vat boolean not null default false;
