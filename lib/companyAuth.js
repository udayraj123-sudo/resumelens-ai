import { getSupabase } from "./supabase";
import { getCompanyId } from "./session";

// Returns the logged-in company (from the signed cookie, re-checked in the database),
// or null if not logged in / not active. Never trust a company id sent by the browser.
export async function requireCompany() {
  const id = await getCompanyId();
  if (!id) return null;
  const { data } = await getSupabase()
    .from("companies")
    .select("id,name,slug,email,status,monthly_limit")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.status !== "active") return null;
  return data;
}