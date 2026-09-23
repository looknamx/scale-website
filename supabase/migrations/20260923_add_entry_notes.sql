alter table public.job_entries
  add column if not exists notes text not null default '';
