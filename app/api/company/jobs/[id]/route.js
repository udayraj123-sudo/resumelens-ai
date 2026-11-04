import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/companyAuth";
import { cleanJob } from "@/lib/jobValidate";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PUT(request, { params }) {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const c = cleanJob(body);
  if (c.error) return NextResponse.json({ error: c.error }, { status: 400 });

  // company_id in the filter = a company can never touch another company's job
  const { data, error } = await db()
    .from("jobs")
    .update(c.value)
    .eq("id", id)
    .eq("company_id", company.id)
    .select("id,title,description,skills,created_at")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json({ job: data });
}

export async function DELETE(_request, { params }) {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const { error } = await db().from("jobs").delete().eq("id", id).eq("company_id", company.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}