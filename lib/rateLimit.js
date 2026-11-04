// Simple database-backed rate limit (works on serverless).
export function clientIp(request) {
  const xf = request.headers.get("x-forwarded-for") || "";
  return xf.split(",")[0].trim() || "unknown";
}

// Returns true if allowed (and records the hit), false if the limit is reached.
export async function allow(supabase, key, max, windowSeconds) {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await supabase
    .from("rate_hits")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", since);
  if (error) return true; // never lock everyone out because of a database hiccup
  if ((count || 0) >= max) return false;
  await supabase.from("rate_hits").insert({ key });
  return true;
}