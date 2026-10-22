import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { GameRow } from "@/lib/gameTypes";

type Action = "resign" | "offer-draw" | "accept-draw" | "decline-draw" | "abort" | "claim-timeout";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { playerId, action } = (await req.json()) as { playerId: string; action: Action };
  if (!playerId || !action) return NextResponse.json({ error: "bad request" }, { status: 400 });

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

  const color: "w" | "b" | null =
    game.white_player === playerId ? "w" : game.black_player === playerId ? "b" : null;
  if (!color) return NextResponse.json({ error: "not a player in this game" }, { status: 403 });

  let patch: Record<string, unknown> | null = null;

  if (action === "resign") {
    patch = { status: "finished", result: color === "w" ? "0-1" : "1-0", reason: "resignation" };
  } else if (action === "abort") {
    // only before the clock has started (no moves made yet)
    if (game.last_move_at) {
      return NextResponse.json({ error: "game already started" }, { status: 409 });
    }
    patch = { status: "finished", result: null, reason: "aborted" };
  } else if (action === "offer-draw") {
    patch = { draw_offer: color };
  } else if (action === "decline-draw") {
    patch = { draw_offer: null };
  } else if (action === "accept-draw") {
    if (!game.draw_offer || game.draw_offer === color) {
      return NextResponse.json({ error: "no draw offer to accept" }, { status: 409 });
    }
    patch = { status: "finished", result: "1/2-1/2", reason: "draw-agreed", draw_offer: null };
  } else if (action === "claim-timeout") {
    const opponentColor = color === "w" ? "b" : "w";
    const opponentMs = opponentColor === "w" ? game.white_ms : game.black_ms;
    const turnColor = game.fen.split(" ")[1]; // 'w' | 'b' from FEN
    if (turnColor !== opponentColor) {
      return NextResponse.json({ error: "not opponent's turn" }, { status: 409 });
    }
    const elapsed = game.last_move_at ? Date.now() - new Date(game.last_move_at).getTime() : 0;
    if (opponentMs - elapsed > 0) {
      return NextResponse.json({ error: "opponent still has time" }, { status: 409 });
    }
    patch = {
      status: "finished",
      result: color === "w" ? "1-0" : "0-1",
      reason: "timeout",
      [opponentColor === "w" ? "white_ms" : "black_ms"]: 0,
    };
  } else {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  const { error: updateError } = await db.from("games").update(patch).eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true, ...patch });
}
