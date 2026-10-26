import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const SESSION_COOKIE = "session_token";

export type CurrentUser = { id: string; username: string };

export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = supabaseAdmin();
  const { data } = await db
    .from("sessions")
    .select("user_id, users(username)")
    .eq("token", token)
    .single();
  if (!data) return null;

  const username = (data.users as unknown as { username: string } | null)?.username;
  if (!username) return null;
  return { id: data.user_id as string, username };
}
