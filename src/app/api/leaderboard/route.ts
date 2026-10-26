import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { metricDef } from "@/lib/scoreRegistry";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") ?? "";
  const metric = searchParams.get("metric") ?? "";
  const def = metricDef(game, metric);
  if (!def) return NextResponse.json({ error: "unknown game/metric" }, { status: 400 });

  const db = supabaseAdmin();
  const ascending = def.mode === "best-low";
  const { data, error } = await db
    .from("game_stats")
    .select("value, users(username)")
    .eq("game", game)
    .eq("metric", metric)
    .order("value", { ascending })
    .limit(20);
  if (error) return NextResponse.json({ error: "query failed" }, { status: 500 });

  const rows = (data ?? []).map((row) => ({
    username: (row.users as unknown as { username: string } | null)?.username ?? "unknown",
    value: row.value as number,
    display: def.format(row.value as number),
  }));
  return NextResponse.json({ label: def.label, rows });
}
