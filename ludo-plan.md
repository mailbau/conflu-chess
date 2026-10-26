# Multiplayer Ludo — Implementation Plan

Status: plan only, nothing built yet.

## 1. Goal

Ludo for 2–4 players on separate devices, using the same challenge-link flow
as chess: the host creates a game, shares the link, friends join, and the
host starts. Colors with no player stay empty. The game lives inside the
Confluence disguise like every other game.

## 2. Rules (decided)

- **Board:** a 52-square main loop. Each color also has a base, a start
  square, a 5-square home column, and a finish.
- **Leaving base:** a token can only leave base on a roll of **6**. It
  enters on its color's start square.
- **Moving:** each turn you roll one die, then move one token that many
  squares.
- **Extra roll** after rolling a 6, capturing a token, or getting a token
  to the finish. **No forfeit** for three 6s in a row.
- **Capture:** landing on a square held by opponent tokens sends them back
  to base. If several opponent tokens share the square, all of them go
  back.
- **Safe squares:** the 4 start squares and 4 star squares. Nobody can be
  captured there, and different colors can share them.
- **Own tokens may stack** on any square. There are no blockades.
- **Home column:** a token turns into its own color's column after one full
  lap. No capture is needed first (that regional rule stays off). Only that
  color can enter its column.
- **Finishing needs an exact roll.** A move that would overshoot the
  finish isn't allowed.
- **No legal move**, e.g. all tokens in base and no 6: the turn passes. A
  6 with no legal move still passes.
- **Auto-move:** when exactly one move is legal, it's played automatically.
- **Win:** the first player to get all 4 tokens home wins, and the game
  ends there. Ranking 2nd/3rd place is left out for now and can come
  later.
- **Turn timer:** 30 s per action (the roll, then the token choice). On
  timeout the server rolls automatically and picks a move, preferring the
  token furthest along. Players who keep timing out stay in on auto-play.

## 3. Architecture (same backbone as chess)

```
Browser (each player)               Vercel (Next.js API routes)         Supabase
render state from row   ── POST ──▶ /api/ludo/[id]/action               ludo_games (public read)
send one action                     load → engine.apply() → save   ──▶  Realtime on ludo_games
subscribe to Realtime   ◀── push ──────────────────────────────────────
```

- **Server-authoritative.** The client only sends intents (`roll`,
  `move {token}`). Dice are rolled on the server with `crypto.randomInt`, so
  nobody can fake a roll.
- **Pure rules engine** `src/lib/ludo/engine.ts`:
  `apply(state, playerId, action, rng, now) → { state } | { error }`. It has
  no database or React code, so it can be tested with a plain script.
- **One action endpoint** handles join, start, roll, move, and
  claimTimeout.
- **Identity** is the existing `getPlayerId()` localStorage UUID plus a
  nickname. Reopening the link on the same browser reconnects to your seat.
- **Concurrency:** only the current player can act, but a timeout claim can
  race the player's own last-second move. So the row gets a `version` column
  and every save is `update … where id = $id and version = $old`. If that
  fails, the route reloads, re-applies once, and otherwise returns 409 so
  the client resyncs.
- **No hidden information** (no cards or decks), so no secrets table is
  needed.

## 4. Database (run once in the Supabase SQL Editor)

```sql
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
```

## 5. State (`src/lib/ludo/types.ts`)

```ts
type Color = "red" | "green" | "yellow" | "blue";

type Player = {
  id: string; name: string; color: Color;
  tokens: [number, number, number, number]; // progress: -1 base, 0..50 main track, 51..55 home column, 56 finished
};

type Phase =
  | { kind: "lobby" }
  | { kind: "roll" }
  | { kind: "move"; roll: number; legal: number[] }   // token indexes that can move
  | { kind: "finished"; winner: string };

type LudoState = {
  players: Player[];          // seat order = turn order
  current: number;
  phase: Phase;
  lastRoll: number | null;
  turnStartedAt: string;      // for the 30 s timer
  log: string[];              // last ~30 events
};
```

**Token positions are stored relative to each player.** Progress `p` on the
main track (0–50) maps to the board square `(START[color] + p) % 52`,
where `START = { red: 0, green: 13, yellow: 26, blue: 39 }`. So every color
moves with the same arithmetic, and captures compare board squares.
Progress 51–55 is the color's own home column, which can never collide with
other colors, and 56 means finished.

**Safe board squares:** `0, 8, 13, 21, 26, 34, 39, 47` (the 4 starts and
the 4 stars).

## 6. Engine logic (`src/lib/ludo/engine.ts`)

| Action | Who | Valid when | Effect |
|---|---|---|---|
| `join {name}` | anyone | lobby, fewer than 4 players | takes the next free color |
| `leave` | a joined player | lobby | frees the seat |
| `start` | host | lobby, at least 2 players | phase becomes `roll`, the timer starts |
| `roll` | current player | `roll` | rolls 1–6 and works out the legal tokens. None: next turn. Exactly one: auto-move. Otherwise phase becomes `move`. |
| `move {token}` | current player | `move` and the token is legal | moves, captures, then gives an extra roll (6, capture, or finish) or passes to the next turn, and checks for a win |
| `claimTimeout` | anyone connected | `now − turnStartedAt ≥ 30 s` (checked on the server) | does the auto-roll and auto-move for the current player |

Helpers:
- `legalMoves(player, roll)`: a base token needs a 6; otherwise
  `progress + roll ≤ 56`.
- `boardSquare(color, progress)`
- `nextTurn(state)`: skips to the next seat; the timer resets on every phase
  change.

## 7. API routes

```
POST /api/ludo                 {playerId, name} → {id}   creates the row; the host joins as red
POST /api/ludo/[id]/action     {playerId, action}  → {ok} | {error}
```

The action route loads the row, runs `engine.apply` (with the server time
and the crypto die), saves with the version check, and retries once on
conflict. Realtime then pushes the new row to everyone.

## 8. Frontend

```
src/lib/ludo/board.ts                 grid coordinates: 52 main squares, 4×5 home columns, 4×4 base slots, finish center
src/app/ludo/page.tsx                 disguised BRD page: name input + "Create game"
src/app/ludo/[id]/page.tsx            disguised BRD page → <LudoGame id>  (export const instant = false, like chess/[id])
src/components/ludo/LudoGame.tsx      fetch the row, subscribe, send actions, lobby/share-link view, timer, timeout claim
src/components/ludo/LudoBoard.tsx     15×15 CSS grid, tokens positioned from board.ts, legal tokens highlighted and clickable
+ .module.css files in the Confluence dark palette (muted red/green/yellow/blue so it still looks like a doc diagram)
```

- **One click to move:** after a roll, the legal tokens pulse, and clicking
  one sends `move`.
- **Dice:** a "Roll" button on your turn showing the last roll's face.
  Reuse the `sound.ts` beeps for roll, capture, and win.
- **Timer bar** for the current player. Like chess, any client sends
  `claimTimeout` once the bar hits 0, and the server re-checks the time.
- **Same-square stacking:** tokens on the same square are drawn slightly
  offset or shrunk so each one stays clickable.
- **Mobile:** a 15×15 grid fits a phone screen width (cells about 22 px).
- **No optimistic updates:** each action waits about 200–400 ms for the
  server reply, which is fine for a dice game.
- **Disguise:** add `LUDO_TITLE = "BRD 2026 061 OPS COG Simulasi Rute
  Distribusi Kas Antar Cabang"`, an entry in `REAL_LINKS`, a home TOC row,
  and `DocControlTable`/`FillerIntro`/`FillerOutro` around the board.

## 9. Edge cases

- **Disconnect:** the state lives in the database, so reopening the link
  resumes. While you're away the timer keeps playing your turns, so the
  game never stalls.
- **Join after start:** the link opens in spectator mode.
- **Host leaves the lobby:** host passes to the next seat. With nobody
  left, the game is abandoned.
- **Stale clicks** (e.g. a move after a timeout already played): the
  engine rejects them and the client resyncs.
- **Duplicate tabs for the same player:** harmless, because the version
  check puts their actions in order.

## 10. Testing

`scripts/ludo-check.ts`, run with `npx tsx scripts/ludo-check.ts`. It's one
assert script against the pure engine with fixed dice. It checks:
- the 52 main squares, 20 home-column squares, and 16 base slots in
  `board.ts` are all distinct coordinates (catches board-mapping typos)
- leaving base only on a 6
- a capture sends the opponent home and gives an extra roll; capture is
  blocked on safe squares
- an exact roll is needed to finish, and an overshoot is not a legal move
- extra rolls on a 6 and on finishing, with no forfeit after three 6s
- no legal moves passes the turn, and a single legal move is played
  automatically
- a timeout is rejected before 30 s and auto-plays after it
- a scripted game runs to a winner

Manually: normal and incognito windows on the dev server, then the Vercel
deployment.

## 11. Build phases (each ends with build → commit → push → deploy)

| # | Phase | Delivers |
|---|---|---|
| 1 | Engine + board data | types, engine, board.ts, check script passing |
| 2 | Backend | SQL (you run it in the dashboard), create and action routes with the version check |
| 3 | Playable UI | lobby, board, roll/move, Realtime sync, disguise page. **Playable deploy.** |
| 4 | Turn timer | timer bar, claimTimeout, auto-play |
| 5 | Polish | step-by-step token hop animation, sounds, stacked-token display, mobile pass |

Rough size: ~800–1,200 lines, about the same as chess.
