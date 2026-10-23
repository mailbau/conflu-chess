import { Chess } from "chess.js";

// Premoves are validated against the CURRENT board with the turn forced to
// the premover's color — this catches obviously illegal moves (wrong piece,
// blocked path) but can't know what the opponent is about to play, so a
// premove can still be rejected once it's actually attempted. That's
// standard premove behavior (chess.com works the same way).
function withForcedTurn(fen: string, color: "w" | "b"): string {
  const parts = fen.split(" ");
  parts[1] = color;
  return parts.join(" ");
}

export function premoveTargets(fen: string, from: string, color: "w" | "b"): string[] {
  const chess = new Chess();
  try {
    chess.load(withForcedTurn(fen, color));
  } catch {
    return [];
  }
  const piece = chess.get(from as never);
  if (!piece || piece.color !== color) return [];
  return chess.moves({ square: from as never, verbose: true }).map((m) => m.to);
}

// returns the resulting board (piece placement only matters for display) or
// null if the move isn't even pseudo-legal on the current board
export function applyForcedMove(
  fen: string,
  from: string,
  to: string,
  color: "w" | "b",
  promotion = "q"
): string | null {
  const chess = new Chess();
  try {
    chess.load(withForcedTurn(fen, color));
  } catch {
    return null;
  }
  let move;
  try {
    move = chess.move({ from: from as never, to: to as never, promotion });
  } catch {
    return null;
  }
  return move ? chess.fen() : null;
}
