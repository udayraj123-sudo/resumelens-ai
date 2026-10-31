import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminAuth";
import { sendHireEmail } from "@/lib/mailer";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request, { params }) {
  if (!(await isAdmin())) return bad("Unauthorized", 401);
  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) return bad("Invalid candidate.");

    const body = await request.json();
    const joiningDate = String(body?.joiningDate || "");
    const message = String(body?.message || "").trim();

    if (!DATE_RE.test(joiningDate)) return bad("Please choose a joining date.");
    const when = new Date(joiningDate + "T00:00:00Z");
    if (Number.isNaN(when.getTime())) return bad("Invalid joining date.");
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = (when.getTime() - Date.now()) / dayMs;
    if (diffDays < -1) return bad("Joining date cannot be in the past.");
    if (diffDays > 365) return bad("Joining date is too far away.");
    if (message.length > 500) return bad("Message is too long (max 500 characters).");

    const supabase = getSupabase();

    // Pehle "hired" mark karte hain (double click pe do email na jayein)
    const { data: claimed, error: claimError } = await supabase
      .from("applications")
      .update({
        status: "hired",
        joining_date: joiningDate,
        hire_message: message || null,
        hired_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "applied")
      .select("id, name, email, jobs(title)")
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return bad("This candidate is already hired or no longer exists.", 409);

    try {
      await sendHireEmail({
        to: claimed.email,
        name: claimed.name,
        jobTitle: claimed.jobs?.title || "the position",
        joiningDate,
        message,
      });
    } catch (mailErr) {
      console.error("Hire email failed:", mailErr.message);
      // Email nahi gaya to wapas "applied" kar do, taaki dobara try kar sake
      await supabase
        .from("applications")
        .update({ status: "applied", joining_date: null, hire_message: null, hired_at: null })
        .eq("id", id);
      return bad("Could not send the email. The candidate was not marked as hired.", 502);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST hire failed:", err.message);
    return bad("Something went wrong. Please try again.", 500);
  }
}