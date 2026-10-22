import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { playerId, baseMin, incSec, color } = await req.json();
  if (!playerId || typeof baseMin !== "number" || typeof incSec !== "number") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const baseMs = Math.round(baseMin * 60_000);
  const incMs = Math.round(incSec * 1000);
  const creatorIsWhite = color === "random" ? Math.random() < 0.5 : color === "white";

  const { data, error } = await supabaseAdmin()
    .from("games")
    .insert({
      white_player: creatorIsWhite ? playerId : null,
      black_player: creatorIsWhite ? null : playerId,
      base_ms: baseMs,
      increment_ms: incMs,
      white_ms: baseMs,
      black_ms: baseMs,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
