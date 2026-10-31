import { createClient } from "@supabase/supabase-js";

// Sirf server me use hoga (API routes). Isko kisi "use client" file me kabhi import mat karna.
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase env variables are missing in .env.local");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}