create table ludo_games (
  id uuid primary key default gen_random_uuid(),
  host_player text not null,
  status text not null default 'lobby',   -- lobby | active | finished
  state jsonb not null,
  version int not null default 0,
  created_at timestamptz default now()
);

alter table ludo_games enable row level security;
create policy "read" on ludo_games for select using (true);

alter publication supabase_realtime add table ludo_games;
