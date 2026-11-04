// Applications a company received since the start of this month (UTC).
export function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export async function getUsage(supabase, companyId) {
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("created_at", monthStart());
  return count || 0;
}