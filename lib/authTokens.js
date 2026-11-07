import { newToken, hashToken } from "./security";

// verify link lives 24 hours, reset link lives 1 hour
const TTL = { verify: 24 * 60 * 60 * 1000, reset: 60 * 60 * 1000 };

// creates a fresh token (old unused ones of the same kind are removed)
export async function createAuthToken(supabase, companyId, purpose) {
  await supabase
    .from("auth_tokens")
    .delete()
    .eq("company_id", companyId)
    .eq("purpose", purpose)
    .is("used_at", null);

  const token = newToken();
  const { error } = await supabase.from("auth_tokens").insert({
    company_id: companyId,
    purpose,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + TTL[purpose]).toISOString(),
  });
  if (error) throw error;
  return token;
}

// marks the token as used and returns the company id, or null if invalid, used or expired
export async function consumeAuthToken(supabase, token, purpose) {
  if (typeof token !== "string" || token.length < 20 || token.length > 200) return null;
  const { data } = await supabase
    .from("auth_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", hashToken(token))
    .eq("purpose", purpose)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("company_id")
    .maybeSingle();
  return data ? data.company_id : null;
}