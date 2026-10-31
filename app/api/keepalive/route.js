import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("jobs")
      .select("id", { head: true, count: "exact" });

    if (error) {
      console.error("keepalive failed:", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("keepalive failed:", err.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}