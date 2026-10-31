import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request) {
  try {
    const email = (new URL(request.url).searchParams.get("email") || "")
      .trim()
      .toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("applications")
      .select("status, created_at, joining_date, jobs(title)")
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
    console.error("GET /api/status failed:", err.message);
    return NextResponse.json({ error: "Could not check status." }, { status: 500 });
  }
}