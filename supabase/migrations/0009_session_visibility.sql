-- Training: ausgeblendete („heute nicht“) und zurückgeholte Übungen.
alter table public.sessions add column if not exists skipped jsonb;
alter table public.sessions add column if not exists shown jsonb;
