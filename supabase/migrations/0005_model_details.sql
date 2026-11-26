-- Gerätemodelle: Modellnummer, Quelle und Kennzeichen „aus Herstellerangaben“.
-- VOR dem (erneuten) Ausführen von 0002_seed_catalog.sql ausführen.
alter table public.equipment_models add column if not exists model_number text;
alter table public.equipment_models add column if not exists source_url text;
alter table public.equipment_models add column if not exists verified boolean;
