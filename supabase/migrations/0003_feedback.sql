-- Feedback aus der App (Profil → Feedback senden). Nutzer dürfen nur eigenes Feedback anlegen, nicht lesen.
-- Lesen im Supabase-Dashboard (Table Editor → feedback).
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.uid()::text,
  email text,
  message text not null check (char_length(message) between 1 and 5000),
  app_version text,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback for insert to authenticated with check (user_id = auth.uid()::text);
