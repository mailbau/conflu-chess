import {
  BASE,
  COLORS,
  FINISHED,
  HOME_START,
  LOG_LIMIT,
  MAX_PLAYERS,
  TURN_TIMEOUT_MS,
  type Color,
  type LudoState,
  type Player,
} from "./types";
import { boardSquare, SAFE_SQUARES } from "./board";

export type EngineResult = { state: LudoState } | { error: string };

export type Action =
  | { type: "join"; name: string }
  | { type: "leave" }
  | { type: "start" }
  | { type: "roll" }
  | { type: "move"; token: number }
  | { type: "claimTimeout" };

export function initialState(): LudoState {
  return {
    players: [],
    current: 0,
    phase: { kind: "lobby" },
    lastRoll: null,
    turnStartedAt: new Date().toISOString(),
    log: [],
  };
}

function pushLog(state: LudoState, line: string) {
  state.log = [...state.log, line].slice(-LOG_LIMIT);
}

function startTimer(state: LudoState, now: number) {
  state.turnStartedAt = new Date(now).toISOString();
}

// progress of a token after moving `roll` squares; null if not legal
function progressAfter(progress: number, roll: number): number | null {
  if (progress === BASE) return roll === 6 ? 0 : null;
  if (progress === FINISHED) return null;
  const next = progress + roll;
  if (next > FINISHED) return null;
  return next;
}

function legalMoves(player: Player, roll: number): number[] {
  const out: number[] = [];
  player.tokens.forEach((p, i) => {
    if (progressAfter(p, roll) !== null) out.push(i);
  });
  return out;
}

// apply a move for player at `playerIdx`, token `tokenIdx`, using `roll`.
// returns whether the move earns another roll (capture, finish, or a 6).
function applyMove(state: LudoState, playerIdx: number, tokenIdx: number, roll: number): boolean {
  const player = state.players[playerIdx];
  const from = player.tokens[tokenIdx];
  const to = progressAfter(from, roll);
  if (to === null) throw new Error("illegal move passed to applyMove");

  player.tokens[tokenIdx] = to;
  pushLog(state, `${player.name} moved a token to ${describeProgress(player.color, to)}`);

  let captured = false;
  if (to < HOME_START && to !== FINISHED) {
    const square = boardSquare(player.color, to);
    if (!SAFE_SQUARES.has(square)) {
      for (const other of state.players) {
        if (other.color === player.color) continue;
        other.tokens.forEach((op, oi) => {
          if (op === BASE || op >= HOME_START) return;
          if (boardSquare(other.color, op) === square) {
            other.tokens[oi] = BASE;
            captured = true;
            pushLog(state, `${player.name} sent ${other.name}'s token home`);
          }
        });
      }
    }
  }

  const finished = to === FINISHED;
  if (finished) pushLog(state, `${player.name} got a token home!`);

  return roll === 6 || captured || finished;
}

function describeProgress(color: Color, progress: number): string {
  if (progress === BASE) return "base";
  if (progress === FINISHED) return "the finish";
  if (progress >= HOME_START) return `${color}'s home column`;
  return `square ${boardSquare(color, progress)}`;
}

function checkWin(state: LudoState, playerIdx: number): boolean {
  const player = state.players[playerIdx];
  if (player.tokens.every((p) => p === FINISHED)) {
    state.phase = { kind: "finished", winner: player.id };
    pushLog(state, `${player.name} wins!`);
    return true;
  }
  return false;
}

function advanceTurn(state: LudoState, now: number) {
  state.current = (state.current + 1) % state.players.length;
  state.phase = { kind: "roll" };
  state.lastRoll = null;
  startTimer(state, now);
}

function rollAndResolve(state: LudoState, playerIdx: number, roll: number, now: number) {
  const player = state.players[playerIdx];
  state.lastRoll = roll;
  const legal = legalMoves(player, roll);

  if (legal.length === 0) {
    pushLog(state, `${player.name} rolled ${roll}, no legal move`);
    advanceTurn(state, now);
    return;
  }

  // several legal tokens can still be a non-choice if they're all sitting on
  // the exact same square (e.g. multiple tokens still in base) — auto-play
  // those, and only ask the player when the options actually differ
  const distinctFrom = new Set(legal.map((i) => player.tokens[i]));
  if (distinctFrom.size === 1) {
    const again = applyMove(state, playerIdx, legal[0], roll);
    if (checkWin(state, playerIdx)) return;
    if (again) {
      state.phase = { kind: "roll" };
      startTimer(state, now);
    } else {
      advanceTurn(state, now);
    }
    return;
  }

  state.phase = { kind: "move", roll, legal };
  startTimer(state, now);
}

// pick the token furthest along, for auto-play on timeout
function bestAutoToken(player: Player, legal: number[]): number {
  return legal.reduce((best, i) =>
    player.tokens[i] > player.tokens[best] ? i : best
  , legal[0]);
}

export function apply(
  state: LudoState,
  playerId: string,
  action: Action,
  rollDie: () => number,
  now: number
): EngineResult {
  const next: LudoState = structuredClone(state);

  switch (action.type) {
    case "join": {
      if (next.phase.kind !== "lobby") return { error: "game already started" };
      if (next.players.some((p) => p.id === playerId)) return { state: next };
      if (next.players.length >= MAX_PLAYERS) return { error: "game is full" };
      const used = new Set(next.players.map((p) => p.color));
      const color = COLORS.find((c) => !used.has(c));
      if (!color) return { error: "game is full" };
      next.players.push({
        id: playerId,
        name: action.name.slice(0, 24) || "Player",
        color,
        tokens: [-1, -1, -1, -1],
      });
      pushLog(next, `${action.name} joined as ${color}`);
      return { state: next };
    }

    case "leave": {
      if (next.phase.kind !== "lobby") return { error: "game already started" };
      next.players = next.players.filter((p) => p.id !== playerId);
      return { state: next };
    }

    case "start": {
      if (next.phase.kind !== "lobby") return { error: "game already started" };
      if (next.players.length < 2) return { error: "need at least 2 players" };
      if (next.players[0].id !== playerId) return { error: "only the host can start" };
      next.current = 0;
      next.phase = { kind: "roll" };
      startTimer(next, now);
      pushLog(next, "Game started");
      return { state: next };
    }

    case "roll": {
      if (next.phase.kind !== "roll") return { error: "not time to roll" };
      const current = next.players[next.current];
      if (current.id !== playerId) return { error: "not your turn" };
      rollAndResolve(next, next.current, rollDie(), now);
      return { state: next };
    }

    case "move": {
      if (next.phase.kind !== "move") return { error: "not time to move" };
      const current = next.players[next.current];
      if (current.id !== playerId) return { error: "not your turn" };
      if (!next.phase.legal.includes(action.token)) return { error: "illegal token" };
      const again = applyMove(next, next.current, action.token, next.phase.roll);
      if (checkWin(next, next.current)) return { state: next };
      if (again) {
        next.phase = { kind: "roll" };
        startTimer(next, now);
      } else {
        advanceTurn(next, now);
      }
      return { state: next };
    }

    case "claimTimeout": {
      if (next.phase.kind !== "roll" && next.phase.kind !== "move") {
        return { error: "nothing to time out" };
      }
      const elapsed = now - new Date(next.turnStartedAt).getTime();
      if (elapsed < TURN_TIMEOUT_MS) return { error: "turn hasn't timed out yet" };

      const current = next.players[next.current];
      if (next.phase.kind === "roll") {
        rollAndResolve(next, next.current, rollDie(), now);
      } else {
        const token = bestAutoToken(current, next.phase.legal);
        const again = applyMove(next, next.current, token, next.phase.roll);
        if (checkWin(next, next.current)) return { state: next };
        if (again) {
          next.phase = { kind: "roll" };
          startTimer(next, now);
        } else {
          advanceTurn(next, now);
        }
      }
      pushLog(next, `${current.name} timed out, played automatically`);
      return { state: next };
    }

    default:
      return { error: "unknown action" };
  }
}
