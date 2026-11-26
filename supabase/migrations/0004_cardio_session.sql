-- Cardio-Einträge können zu einem Krafttraining gehören (z. B. Aufwärmen auf dem Laufband).
alter table public.cardio add column if not exists session_id text;
alter table public.cardio add column if not exists created_at bigint;
create index if not exists cardio_session on public.cardio (session_id);
