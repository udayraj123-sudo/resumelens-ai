import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, name, email, phone, score, matched_skills, missing_skills, reason, status, joining_date, created_at, jobs(title)"
      )
      .order("score", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    const applications = (data || []).map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      jobTitle: a.jobs?.title || "Deleted job",
      score: a.score === null ? null : Number(a.score),
      matchedSkills: a.matched_skills || [],
      missingSkills: a.missing_skills || [],
      reason: a.reason,
      status: a.status,
      joiningDate: a.joining_date,
      appliedOn: a.created_at,
    }));
    return NextResponse.json({ applications });
  } catch (err) {
    console.error("GET /api/admin/applications failed:", err.message);
    return NextResponse.json({ error: "Could not load candidates." }, { status: 500 });
  }
}