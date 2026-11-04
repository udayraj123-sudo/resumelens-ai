import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCompanyBySlug } from "@/lib/companyPublic";
import { getUsage } from "@/lib/usage";

// Public: company name, whether it is accepting applications, and its open jobs.
export async function GET(_request, { params }) {
  const { slug } = await params;
  const supabase = db();
  const company = await getCompanyBySlug(supabase, slug);
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  if (company.status !== "active") {
    return NextResponse.json({ company: { name: company.name }, accepting: false, reason: "paused", jobs: [] });
  }
  const used = await getUsage(supabase, company.id);
  if (used >= company.monthly_limit) {
    return NextResponse.json({ company: { name: company.name }, accepting: false, reason: "limit", jobs: [] });
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id,title")
    .eq("company_id", company.id)
    .order("created_at");
  if (error) return NextResponse.json({ error: "Could not load jobs" }, { status: 500 });
  return NextResponse.json({ company: { name: company.name }, accepting: true, jobs: jobs || [] });
}