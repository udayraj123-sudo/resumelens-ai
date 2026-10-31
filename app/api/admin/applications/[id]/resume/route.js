import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminAuth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid candidate." }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data } = await supabase
      .from("applications")
      .select("resume_path")
      .eq("id", id)
      .maybeSingle();
    if (!data) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }
    // 60 second ka private link, bucket public nahi hai
    const { data: signed, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(data.resume_path, 60);
    if (error || !signed) throw error || new Error("No signed URL");
    return NextResponse.redirect(signed.signedUrl);
  } catch (err) {
    console.error("GET resume failed:", err.message);
    return NextResponse.json({ error: "Could not open the resume." }, { status: 500 });
  }
}