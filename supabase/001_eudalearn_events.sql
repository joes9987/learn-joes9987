-- EudaLearn Ludwitt event log (curriculum-compatible metrics when api.ludwitt.hult is unavailable)
create table if not exists public.eudalearn_events (
  id uuid primary key default gen_random_uuid(),
  app_id text not null,
  event text not null,
  user_id text not null,
  session_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists eudalearn_events_app_id_idx on public.eudalearn_events (app_id);
create index if not exists eudalearn_events_user_id_idx on public.eudalearn_events (user_id);

alter table public.eudalearn_events enable row level security;
-- service role only (no anon policies)
