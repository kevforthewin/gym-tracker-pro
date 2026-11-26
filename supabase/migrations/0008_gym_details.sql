-- Gyms: Stadtteil, Urban-Sports-Club-Pakete, Art und Quelle. VOR dem (erneuten) Seed 0002 ausführen.
alter table public.gyms add column if not exists district text;
alter table public.gyms add column if not exists usc_plans jsonb;
alter table public.gyms add column if not exists kind text;
alter table public.gyms add column if not exists source_url text;
