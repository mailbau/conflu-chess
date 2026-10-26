import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { apply, type Action } from "@/lib/ludo/engine";
import { rollDie } from "@/lib/ludo/rng";
import type { LudoGameRow } from "@/lib/ludo/gameRow";

function statusFor(phaseKind: string): LudoGameRow["status"] {
  if (phaseKind === "lobby") return "lobby";
  if (phaseKind === "finished") return "finished";
  return "active";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { playerId, action } = (await req.json()) as { playerId: string; action: Action };
  if (!playerId || !action) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const db = supabaseAdmin();

  // one retry on a version conflict (two players acting at once), then give up
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: game, error } = await db
      .from("ludo_games")
      .select("*")
      .eq("id", id)
      .single<LudoGameRow>();
    if (error || !game) return NextResponse.json({ error: "not found" }, { status: 404 });

    const result = apply(game.state, playerId, action, rollDie, Date.now());
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

    const { data: updated, error: updateError } = await db
      .from("ludo_games")
      .update({
        state: result.state,
        status: statusFor(result.state.phase.kind),
        version: game.version + 1,
      })
      .eq("id", id)
      .eq("version", game.version)
      .select("id");

    if (updateError) return NextResponse.json({ error: "save failed" }, { status: 500 });
    if (updated && updated.length > 0) return NextResponse.json({ ok: true });
    // version mismatch: someone else updated first, retry once against fresh state
  }

  return NextResponse.json({ error: "conflict, try again" }, { status: 409 });
}
