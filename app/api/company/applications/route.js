import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/companyAuth";

export async function GET() {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await db()
    .from("applications")
    .select(
      "id,job_id,name,email,phone,score,matched_skills,missing_skills,reason,status,joining_date,hired_at,created_at,resume_path,jobs(title)"
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const applications = data.map(({ resume_path, jobs, ...a }) => ({
    ...a,
    job_title: jobs?.title || "—",
    has_resume: !!resume_path,
  }));
  return NextResponse.json({ applications });
}