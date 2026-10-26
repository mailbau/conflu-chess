import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const name = username.trim();
  if (name.length < 3 || name.length > 20 || !/^[a-zA-Z0-9_]+$/.test(name)) {
    return NextResponse.json(
      { error: "username must be 3-20 characters: letters, numbers, underscore" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "password must be at least 6 characters" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: existing } = await db
    .from("users")
    .select("id")
    .ilike("username", name)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: "username already taken" }, { status: 409 });

  const password_hash = hashPassword(password);
  const { data: user, error } = await db
    .from("users")
    .insert({ username: name, password_hash })
    .select("id, username")
    .single();
  if (error || !user) return NextResponse.json({ error: "signup failed" }, { status: 500 });

  const { data: session, error: sessionError } = await db
    .from("sessions")
    .insert({ user_id: user.id })
    .select("token")
    .single();
  if (sessionError || !session) {
    return NextResponse.json({ error: "signup failed" }, { status: 500 });
  }

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
