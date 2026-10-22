create table games (
  id uuid primary key default gen_random_uuid(),
  white_player text,
  black_player text,
  fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn text not null default '',
  base_ms int not null,
  increment_ms int not null,
  white_ms int not null,
  black_ms int not null,
  last_move_at timestamptz,
  status text not null default 'waiting',
  result text,
  reason text,
  draw_offer text,
  created_at timestamptz default now()
);

alter table games enable row level security;
create policy "read" on games for select using (true);

alter publication supabase_realtime add table games;
