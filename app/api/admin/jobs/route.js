import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminAuth";
import { parseJobInput } from "@/lib/jobInput";

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, description, skills, created_at")
      .order("created_at");
    if (error) throw error;
    return NextResponse.json({ jobs: data });
  } catch (err) {
    console.error("GET /api/admin/jobs failed:", err.message);
    return NextResponse.json({ error: "Could not load jobs." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const parsed = parseJobInput(await request.json());
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .insert(parsed.value)
      .select("id, title, description, skills, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ job: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/jobs failed:", err.message);
    return NextResponse.json({ error: "Could not save the job." }, { status: 500 });
  }
}