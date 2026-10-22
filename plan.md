# Plan: Confluence-style game hub (Next.js + Supabase + Vercel)

## Stack
- **Next.js (App Router) + TypeScript**, deployed on Vercel
- **Plain CSS modules** for the Confluence look. No UI framework, because we're copying a specific look rather than building a design system.
- **Chess:** `chess.js` for the rules, `react-chessboard` for the board
- **Sudoku:** `sudoku-gen` for generating puzzles with difficulty levels
- **Supabase:** a Postgres table for chess games, plus Realtime so both browsers get each move instantly
- **No login.** Each browser gets a random player ID saved in `localStorage`. Whoever has the link can join.

## Architecture
```
Browser A ──POST move──▶ Next.js API route (Vercel) ──validate with chess.js──▶ Supabase games row
Browser B ◀──────────── Supabase Realtime (row change) ◀──────────────────────────┘
```
- Moves go through a Next.js API route, not straight from the browser to the database. The route checks the move is legal and works out the clocks using the server's time, so neither player can cheat the clock or send illegal moves.
- Browsers can only *read* from Supabase, using the public anon key with a read-only security rule. Only the API route can write, using a secret service-role key.

## Database (1 table)
```sql
create table games (
  id uuid primary key default gen_random_uuid(),
  white_player text, black_player text,      -- random browser IDs
  fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn text not null default '',
  base_ms int not null, increment_ms int not null,
  white_ms int not null, black_ms int not null,
  last_move_at timestamptz,                  -- null until first move = clock not started
  status text not null default 'waiting',    -- waiting | active | finished
  result text,                               -- '1-0' | '0-1' | '1/2-1/2'
  reason text,                               -- checkmate | timeout | resign | stalemate | draw-agreed | ...
  draw_offer text,                           -- 'w' | 'b' | null
  created_at timestamptz default now()
);
alter table games enable row level security;
create policy "read" on games for select using (true);
alter publication supabase_realtime add table games;
```

## Routes
| Route | What it does |
|---|---|
| `/` | Fake space home page with links to the "Chess" and "Sudoku" pages in the sidebar |
| `/chess` | Pick a time control (1+0, 3+2, 5+0, 10+0, 15+10, custom) and a color (white/black/random), then **Create challenge** to get a copyable link |
| `/chess/[id]` | Game page: board, both clocks, move list, Resign, Offer draw, Abort |
| `/sudoku` | Pick a difficulty (Easy/Medium/Hard/Expert), then play |
| `POST /api/games` | Create a game |
| `POST /api/games/[id]/join` | Take the empty seat. A third visitor watches as a spectator. |
| `POST /api/games/[id]/move` | Check the move, update the clocks, detect checkmate, stalemate or draw |
| `POST /api/games/[id]/action` | Resign, offer/accept/decline draw, abort, claim timeout |

## Chess clocks
- The database stores `white_ms`, `black_ms` and `last_move_at`. Clocks only tick while it's that player's turn.
- On each move the server does: `mover_ms -= now - last_move_at; mover_ms += increment`. If the result is 0 or less, that player has lost on time.
- The browser shows the countdown locally using `requestAnimationFrame`. When a clock hits 0 it calls `claim timeout`, and the server double-checks before ending the game.
- Clocks start when White makes the first move. Either player can abort before that.

## Sudoku (browser only)
- Generate a puzzle at the chosen difficulty, with notes mode, highlighting of conflicting numbers, a timer, a mistake counter, and a "you solved it" check.
- Progress is saved in `localStorage` so a refresh doesn't lose it.

## Confluence look
- Recreate it from the screenshots: dark theme, a top bar (logo, Spaces/People/Create, search), a collapsible left sidebar with a page tree, breadcrumbs, the page title, a "Created by … last updated …" line, and Watch/Share/… action icons.
- Each game sits in the page body under a fake "Page properties" table, so it looks like an embedded macro.
- All the filler text and names are made up. Nothing is copied from the real BRD export.

## Build phases
1. **Shell:** Next.js setup, Confluence layout components, dummy pages, deploy to Vercel to check it works end to end
2. **Sudoku:** fully playable, no backend involved
3. **Supabase setup:** create the project, run the SQL, add environment variables to Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
4. **Chess core:** create game, join through the link, legal moves synced in real time, game-over detection
5. **Chess clocks and actions:** time controls, increment, timeout, resign, draw, abort
6. **Polish:** mobile layout, copy-link button, sounds, a "waiting for opponent" state, reconnecting after a refresh (game state comes back from the database)

## Left out for now
- **Accounts and login:** add them if you ever need ratings or game history.
- **Rematch button:** for now just create a new challenge.
- **Multiplayer sudoku:** add it if you want it later.
