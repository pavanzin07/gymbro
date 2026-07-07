-- MEU GYM BRO — schema de sincronização
-- Rode este script no SQL Editor do seu projeto Supabase (uma vez só).

create table if not exists public.gym_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.gym_states enable row level security;

-- Cada usuário só enxerga e mexe no próprio estado.
create policy "own state select" on public.gym_states
  for select using (auth.uid() = user_id);

create policy "own state insert" on public.gym_states
  for insert with check (auth.uid() = user_id);

create policy "own state update" on public.gym_states
  for update using (auth.uid() = user_id);
