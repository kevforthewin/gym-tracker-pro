-- gym-tracker-pro: Schema, Sync-Trigger und Row Level Security
-- Im Supabase-Dashboard unter "SQL Editor" einfügen und ausführen (einmalig).
-- Danach 0002_seed_catalog.sql ausführen.

-- ---------------------------------------------------------------------------
-- Sync-Trigger: Last-Write-Wins je Zeile + Server-Zeitstempel für den Pull-Cursor
-- ---------------------------------------------------------------------------
create or replace function public.sync_row() returns trigger
language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return null; -- ältere Änderung (z. B. von einem Gerät, das lange offline war) verwerfen
  end if;
  new.server_updated_at := clock_timestamp();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- GETEILT: Katalog, Gyms, Geräte im Gym
-- ---------------------------------------------------------------------------
create table if not exists public.manufacturers (
  id text primary key,
  name text not null,
  created_by text,
  updated_at bigint not null,
  deleted_at bigint,
  server_updated_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id text primary key,
  name text not null,
  type text not null check (type in ('weight_reps', 'bodyweight', 'time_distance')),
  muscle_group text,
  split text not null default 'other' check (split in ('push', 'pull', 'legs', 'other')),
  free_weight boolean,
  created_by text,
  updated_at bigint not null,
  deleted_at bigint,
  server_updated_at timestamptz not null default now()
);

create table if not exists public.equipment_models (
  id text primary key,
  manufacturer_id text not null,
  name text not null,
  line text,
  kind text not null,
  exercise_id text,
  weight_step_kg real,
  created_by text,
  updated_at bigint not null,
  deleted_at bigint,
  server_updated_at timestamptz not null default now()
);

create table if not exists public.gyms (
  id text primary key,
  name text not null,
  chain text,
  address text,
  city text,
  created_by text,
  updated_at bigint not null,
  deleted_at bigint,
  server_updated_at timestamptz not null default now()
);

create table if not exists public.gym_machines (
  id text primary key,
  gym_id text not null,
  exercise_id text not null,
  model_id text,
  label text not null,
  weight_step_kg real not null default 2.5,
  weight_steps jsonb,
  created_by text,
  updated_at bigint not null,
  deleted_at bigint,
  server_updated_at timestamptz not null default now()
);
create index if not exists gym_machines_gym on public.gym_machines (gym_id);

-- ---------------------------------------------------------------------------
-- PRIVAT: gehört genau einem Nutzer
-- ---------------------------------------------------------------------------
create table if not exists public.user_gyms (
  id text primary key, user_id text not null,
  gym_id text not null, favorite boolean,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.machine_notes (
  id text primary key, user_id text not null,
  machine_id text not null, note text not null default '', start_weight_kg real,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.plans (
  id text primary key, user_id text not null,
  name text not null, sort_order int not null default 0,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.plan_days (
  id text primary key, user_id text not null,
  plan_id text not null, name text not null, sort_order int not null default 0,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.plan_day_exercises (
  id text primary key, user_id text not null,
  plan_day_id text not null, exercise_id text not null, sort_order int not null default 0,
  sets int not null, rep_min int not null, rep_max int not null,
  target_duration_sec int, target_distance_m real,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.sessions (
  id text primary key, user_id text not null,
  gym_id text not null, plan_day_id text,
  started_at bigint not null, finished_at bigint,
  machine_for jsonb, sort_order jsonb, notes text,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.sets (
  id text primary key, user_id text not null,
  session_id text not null, machine_id text, exercise_id text not null, set_index int not null,
  weight_kg real, reps int, duration_sec int, distance_m real,
  is_warmup boolean not null default false, excluded boolean, exclude_reason text,
  created_at bigint not null,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.bodyweights (
  id text primary key, user_id text not null,
  date text not null, weight_kg real not null,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);
create table if not exists public.cardio (
  id text primary key, user_id text not null,
  date text not null, kind text not null, duration_min real not null,
  distance_km real, kcal real, gym_id text,
  updated_at bigint not null, deleted_at bigint, server_updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Trigger, Indizes und Row Level Security für alle Tabellen
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  shared text[] := array['manufacturers', 'exercises', 'equipment_models', 'gyms', 'gym_machines'];
  private text[] := array['user_gyms', 'machine_notes', 'plans', 'plan_days', 'plan_day_exercises',
                          'sessions', 'sets', 'bodyweights', 'cardio'];
begin
  foreach t in array shared || private loop
    execute format('drop trigger if exists %I_sync on public.%I', t, t);
    execute format('create trigger %I_sync before insert or update on public.%I for each row execute function public.sync_row()', t, t);
    execute format('create index if not exists %I_srv on public.%I (server_updated_at)', t, t);
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- Geteilt: alle angemeldeten Nutzer lesen; jeder legt an (als er selbst); ändern nur der Ersteller
  foreach t in array shared loop
    execute format('drop policy if exists %I_read on public.%I', t, t);
    execute format('create policy %I_read on public.%I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists %I_insert on public.%I', t, t);
    execute format('create policy %I_insert on public.%I for insert to authenticated with check (created_by = auth.uid()::text)', t, t);
    execute format('drop policy if exists %I_update on public.%I', t, t);
    execute format('create policy %I_update on public.%I for update to authenticated using (created_by = auth.uid()::text) with check (created_by = auth.uid()::text)', t, t);
  end loop;

  -- Privat: nur eigene Zeilen
  foreach t in array private loop
    execute format('create index if not exists %I_user on public.%I (user_id)', t, t);
    execute format('drop policy if exists %I_own on public.%I', t, t);
    execute format('create policy %I_own on public.%I for all to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text)', t, t);
  end loop;
end $$;
