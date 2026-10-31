import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title")
      .order("created_at");

    if (error) throw error;
    return NextResponse.json({ jobs: data });
  } catch (err) {
    console.error("GET /api/jobs failed:", err.message);
    return NextResponse.json({ error: "Could not load jobs" }, { status: 500 });
  }
}