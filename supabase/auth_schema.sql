create table users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);
-- case-insensitive uniqueness: "Alice" and "alice" can't both exist
create unique index users_username_lower_idx on users (lower(username));

create table sessions (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz default now()
);

create table game_stats (
  user_id uuid not null references users(id) on delete cascade,
  game text not null,
  metric text not null,
  value double precision not null,
  updated_at timestamptz default now(),
  primary key (user_id, game, metric)
);

-- no public read policies anywhere here: RLS stays default-deny, and every
-- read (leaderboards, "who am I") goes through an API route using the
-- service-role key, which returns only the curated fields (username + value,
-- never password_hash or session tokens) -- unlike the games tables, nothing
-- here needs direct anon-key/Realtime access from the browser
alter table users enable row level security;
alter table sessions enable row level security;
alter table game_stats enable row level security;
