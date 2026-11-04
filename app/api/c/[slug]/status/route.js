import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCompanyBySlug } from "@/lib/companyPublic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A candidate checks the status of their applications at THIS company only.
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const email = (new URL(request.url).searchParams.get("email") || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    const supabase = db();
    const company = await getCompanyBySlug(supabase, slug);
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("applications")
      .select("status, created_at, joining_date, jobs(title)")
      .eq("company_id", company.id)
      .eq("email", email)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const applications = (data || []).map((a) => ({
      jobTitle: a.jobs?.title || "Unknown job",
      status: a.status,
      appliedOn: a.created_at,
      joiningDate: a.joining_date,
    }));
    return NextResponse.json({ applications });
  } catch (err) {
    console.error("GET /api/c/[slug]/status failed:", err.message);
    return NextResponse.json({ error: "Could not check status." }, { status: 500 });
  }
}