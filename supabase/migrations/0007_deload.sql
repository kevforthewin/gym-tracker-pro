-- Deload-Wochen: Intervall je Plan und Kennzeichen am Training.
alter table public.plans add column if not exists deload_every int;
alter table public.sessions add column if not exists deload boolean;
