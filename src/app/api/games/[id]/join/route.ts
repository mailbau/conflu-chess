import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { playerId } = await req.json();
  if (!playerId) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const db = supabaseAdmin();
  const { data: game, error } = await db.from("games").select("*").eq("id", id).single();
  if (error || !game) return NextResponse.json({ error: "not found" }, { status: 404 });

  // already seated (reconnect) or spectating: nothing to do
  if (game.white_player === playerId || game.black_player === playerId) {
    return NextResponse.json({ ok: true });
  }

  // fill the empty seat
  const patch: Record<string, unknown> = {};
  if (!game.white_player) patch.white_player = playerId;
  else if (!game.black_player) patch.black_player = playerId;
  else return NextResponse.json({ ok: true, spectator: true }); // both seats taken

  if (game.white_player && game.black_player === null && patch.black_player) {
    patch.status = "active";
  }
  if (game.black_player && game.white_player === null && patch.white_player) {
    patch.status = "active";
  }

  const { error: updateError } = await db.from("games").update(patch).eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
