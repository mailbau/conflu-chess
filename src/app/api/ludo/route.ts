import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { apply, initialState } from "@/lib/ludo/engine";
import { rollDie } from "@/lib/ludo/rng";

export async function POST(req: Request) {
  const { playerId, name } = await req.json();
  if (!playerId || !name) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const result = apply(initialState(), playerId, { type: "join", name }, rollDie, Date.now());
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("ludo_games")
    .insert({ host_player: playerId, status: "lobby", state: result.state })
    .select("id")
    .single();

  if (error || !data) return NextResponse.json({ error: "failed to create game" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
