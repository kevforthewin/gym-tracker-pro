-- Plan: Übungen je Gym ausblenden (z. B. kein passendes Gerät in diesem Studio).
alter table public.plan_day_exercises add column if not exists skip_gyms jsonb;
