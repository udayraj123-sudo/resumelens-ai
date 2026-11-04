import { newToken, hashToken } from "./security";

export const INVITE_HOURS = 48;

// Creates a fresh one-time invite for a company (old unused ones are removed).
// Only the hash is stored; the raw token is returned once and shown to the owner once.
export async function createInvite(supabase, companyId) {
  await supabase.from("company_invites").delete().eq("company_id", companyId).is("used_at", null);
  const token = newToken();
  const expires_at = new Date(Date.now() + INVITE_HOURS * 3600 * 1000).toISOString();
  const { error } = await supabase
    .from("company_invites")
    .insert({ company_id: companyId, token_hash: hashToken(token), expires_at });
  if (error) throw new Error(error.message);
  return token;
}

export function originFrom(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto =
    request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}