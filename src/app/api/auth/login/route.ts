import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: user } = await db
    .from("users")
    .select("id, username, password_hash")
    .ilike("username", username.trim())
    .maybeSingle();

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "invalid username or password" }, { status: 401 });
  }

  const { data: session, error } = await db
    .from("sessions")
    .insert({ user_id: user.id })
    .select("token")
    .single();
  if (error || !session) return NextResponse.json({ error: "login failed" }, { status: 500 });

  const res = NextResponse.json({ username: user.username });
  res.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
