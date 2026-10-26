import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth/session";
import { metricDef, combine } from "@/lib/scoreRegistry";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ skipped: "not logged in" });

  const { game, metric, value } = await req.json();
  const def = metricDef(game, metric);
  if (!def || typeof value !== "number" || !Number.isFinite(value)) {
    return NextResponse.json({ error: "unknown game/metric" }, { status: 400 });
  }
  // increment-mode metrics represent "this just happened once" -- the
  // client reports the event, not an arbitrary delta, so nobody can inflate
  // a win counter by posting a huge number
  if (def.mode === "increment" && value !== 1) {
    return NextResponse.json({ error: "increment metrics must submit 1" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: existing } = await db
    .from("game_stats")
    .select("value")
    .eq("user_id", user.id)
    .eq("game", game)
    .eq("metric", metric)
    .maybeSingle();

  const next = combine(def.mode, existing?.value ?? null, value);
  const { error } = await db
    .from("game_stats")
    .upsert(
      { user_id: user.id, game, metric, value: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id,game,metric" }
    );
  if (error) return NextResponse.json({ error: "save failed" }, { status: 500 });

  return NextResponse.json({ ok: true, value: next });
}
