import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminAuth";
import { parseJobInput } from "@/lib/jobInput";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid job." }, { status: 400 });
    }
    const parsed = parseJobInput(await request.json());
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .update(parsed.value)
      .eq("id", id)
      .select("id, title, description, skills, created_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ job: data });
  } catch (err) {
    console.error("PUT /api/admin/jobs/[id] failed:", err.message);
    return NextResponse.json({ error: "Could not save the job." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid job." }, { status: 400 });
    }
    const supabase = getSupabase();

    const { data: apps } = await supabase
      .from("applications")
      .select("resume_path")
      .eq("job_id", id);
    const paths = (apps || []).map((a) => a.resume_path);

    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) throw error;

    if (paths.length > 0) {
      await supabase.storage.from("resumes").remove(paths);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/jobs/[id] failed:", err.message);
    return NextResponse.json({ error: "Could not delete the job." }, { status: 500 });
  }
}