import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/companyAuth";
import { cleanJob } from "@/lib/jobValidate";

export async function GET() {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await db()
    .from("jobs")
    .select("id,title,description,skills,created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: data });
}

export async function POST(request) {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const c = cleanJob(body);
  if (c.error) return NextResponse.json({ error: c.error }, { status: 400 });

  const { data, error } = await db()
    .from("jobs")
    .insert({ ...c.value, company_id: company.id })
    .select("id,title,description,skills,created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job: data }, { status: 201 });
}