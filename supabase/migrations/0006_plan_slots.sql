-- Plan-Vorlagen: Bewegungsplätze in Plänen und die je Training gewählte Übung.
alter table public.plan_day_exercises add column if not exists slot_id text;
alter table public.sessions add column if not exists exercise_for jsonb;
