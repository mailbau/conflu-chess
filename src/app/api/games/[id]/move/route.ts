import { NextResponse } from "next/server";
import { Chess } from "chess.js";
import { supabaseAdmin } from "@/lib/supabase";
import type { GameRow } from "@/lib/gameTypes";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { playerId, from, to, promotion } = await req.json();
  if (!playerId || !from || !to) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: game, error } = await db
    .from("games")
    .select("*")
    .eq("id", id)
    .single<GameRow>();
  if (error || !game) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (game.status === "finished") {
    return NextResponse.json({ error: "game is over" }, { status: 409 });
  }

  const chess = new Chess();
  chess.load(game.fen);
  const moverColor = chess.turn(); // 'w' | 'b'
  const moverId = moverColor === "w" ? game.white_player : game.black_player;
  if (moverId !== playerId) {
    return NextResponse.json({ error: "not your move" }, { status: 403 });
  }

  const now = Date.now();
  let whiteMs = game.white_ms;
  let blackMs = game.black_ms;

  // deduct elapsed time from the mover's clock since their turn started
  if (game.last_move_at) {
    const elapsed = now - new Date(game.last_move_at).getTime();
    if (moverColor === "w") whiteMs -= elapsed;
    else blackMs -= elapsed;
  }

  const moverMsAfterElapsed = moverColor === "w" ? whiteMs : blackMs;
  if (moverMsAfterElapsed <= 0) {
    // ran out of time before making this move
    const patch = {
      status: "finished" as const,
      result: moverColor === "w" ? ("0-1" as const) : ("1-0" as const),
      reason: "timeout",
      white_ms: moverColor === "w" ? 0 : whiteMs,
      black_ms: moverColor === "b" ? 0 : blackMs,
    };
    await db.from("games").update(patch).eq("id", id);
    return NextResponse.json({ error: "time's up", ...patch }, { status: 409 });
  }

  let moveResult;
  try {
    moveResult = chess.move({ from, to, promotion: promotion ?? "q" });
  } catch {
    return NextResponse.json({ error: "illegal move" }, { status: 400 });
  }
  if (!moveResult) return NextResponse.json({ error: "illegal move" }, { status: 400 });

  // add increment to the mover after their move lands
  if (moverColor === "w") whiteMs += game.increment_ms;
  else blackMs += game.increment_ms;

  let status: GameRow["status"] = "active";
  let result: GameRow["result"] = null;
  let reason: string | null = null;

  if (chess.isCheckmate()) {
    status = "finished";
    result = moverColor === "w" ? "1-0" : "0-1";
    reason = "checkmate";
  } else if (chess.isStalemate()) {
    status = "finished";
    result = "1/2-1/2";
    reason = "stalemate";
  } else if (chess.isDraw()) {
    status = "finished";
    result = "1/2-1/2";
    reason = chess.isThreefoldRepetition()
      ? "repetition"
      : chess.isInsufficientMaterial()
        ? "insufficient-material"
        : "fifty-move-rule";
  }

  const patch = {
    fen: chess.fen(),
    pgn: chess.pgn(),
    white_ms: Math.max(0, Math.round(whiteMs)),
    black_ms: Math.max(0, Math.round(blackMs)),
    last_move_at: new Date(now).toISOString(),
    status,
    result,
    reason,
    draw_offer: null, // any move cancels a pending draw offer
  };

  const { error: updateError } = await db.from("games").update(patch).eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true, ...patch });
}
