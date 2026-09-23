alter table public.job_entries
  alter column quantity type numeric(12, 3) using quantity::numeric;
