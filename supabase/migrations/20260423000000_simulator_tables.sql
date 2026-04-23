-- Simulator + persona memory tables
-- ------------------------------------------------------------------------
-- Two tables:
--   simulator_sessions  — one row per onboarding session (full log)
--   persona_memories    — the latest persona per browser/device (keyed
--                         by a client-generated UUID so we can evolve
--                         to real auth later without migrating data)
-- ------------------------------------------------------------------------

create table if not exists public.simulator_sessions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid,                        -- browser UUID from localStorage
  started_at timestamptz default now(),
  ended_at timestamptz,
  device text,                           -- 'mobile' | 'desktop'
  agent_model text,                      -- e.g. claude-sonnet-4-5
  total_interactions integer default 0,
  variant_path text[],                   -- ordered tool calls
  fit_twin_depth integer,                -- how deep into Fit Twin layers
  archetype_id text,
  persona_summary text,
  confidence integer,
  log_json jsonb                         -- full transcript
);

create index if not exists simulator_sessions_client_idx
  on public.simulator_sessions (client_id, started_at desc);

create table if not exists public.persona_memories (
  client_id uuid primary key,            -- one row per client
  updated_at timestamptz default now(),
  archetype_id text,
  persona_summary text,
  persona_json jsonb,                    -- structured fit + budget + signals
  confidence integer,
  sessions_count integer default 1
);

-- ------------------------------------------------------------------------
-- RLS — permissive for this demo.
-- The anon key can insert/update/select both tables. The service role
-- (used only by the Edge Function and the seed scripts) bypasses RLS.
-- ------------------------------------------------------------------------

alter table public.simulator_sessions enable row level security;
alter table public.persona_memories   enable row level security;

drop policy if exists "anon can insert sessions" on public.simulator_sessions;
create policy "anon can insert sessions"
  on public.simulator_sessions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anon can read own sessions" on public.simulator_sessions;
create policy "anon can read own sessions"
  on public.simulator_sessions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "anon can upsert own persona" on public.persona_memories;
create policy "anon can upsert own persona"
  on public.persona_memories
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anon can update own persona" on public.persona_memories;
create policy "anon can update own persona"
  on public.persona_memories
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "anon can read own persona" on public.persona_memories;
create policy "anon can read own persona"
  on public.persona_memories
  for select
  to anon, authenticated
  using (true);
