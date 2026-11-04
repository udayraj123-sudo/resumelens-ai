const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Finds a company from the /c/<slug> in the link. Returns null if it does not exist.
export async function getCompanyBySlug(supabase, slug) {
  const s = String(slug || "");
  if (s.length > 60 || !SLUG_RE.test(s)) return null;
  const { data } = await supabase
    .from("companies")
    .select("id,name,slug,status,monthly_limit")
    .eq("slug", s)
    .maybeSingle();
  return data || null;
}