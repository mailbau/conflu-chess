import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-safe client: read-only via RLS policy, used for Realtime subscriptions.
export const supabase = createClient(url, anonKey);

// Server-only client: bypasses RLS with the service role key. Never import
// this from a "use client" component — it must stay inside API routes.
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
