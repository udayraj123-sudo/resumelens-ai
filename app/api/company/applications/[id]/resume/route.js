import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/companyAuth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Opens the candidate's resume PDF (a link that works for 60 seconds), only for the owning company.
export async function GET(_request, { params }) {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const supabase = db();
  const { data: app } = await supabase
    .from("applications")
    .select("resume_path")
    .eq("id", id)
    .eq("company_id", company.id)
    .maybeSingle();
  if (!app?.resume_path) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase.storage.from("resumes").createSignedUrl(app.resume_path, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Could not open resume" }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}