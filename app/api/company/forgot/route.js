import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allow, clientIp } from "@/lib/rateLimit";
import { createAuthToken } from "@/lib/authTokens";
import { sendAuthMail } from "@/lib/authMail";
import { originFrom } from "@/lib/invites";

// Always answers "ok" so nobody can use this to find out which emails have accounts.
export async function POST(request) {
  const ok = NextResponse.json({ ok: true });
  try {
    const supabase = db();
    let body = {};
    try {
      body = await request.json();
    } catch {}
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || email.length > 200) return ok;

    if (!(await allow(supabase, "forgot-ip:" + clientIp(request), 6, 3600))) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    if (!(await allow(supabase, "forgot-email:" + email, 3, 3600))) return ok;

    const { data: company } = await supabase
      .from("companies")
      .select("id,name,email_verified_at,password_hash")
      .eq("email", email)
      .maybeSingle();

    if (company && company.password_hash) {
      const origin = originFrom(request).replace(/\/$/, "");
      if (company.email_verified_at) {
        const token = await createAuthToken(supabase, company.id, "reset");
        await sendAuthMail({ to: email, kind: "reset", companyName: company.name, link: origin + "/reset/" + token });
      } else {
        const token = await createAuthToken(supabase, company.id, "verify");
        await sendAuthMail({ to: email, kind: "verify", companyName: company.name, link: origin + "/verify/" + token });
      }
    }
    return ok;
  } catch (err) {
    console.error("POST /api/company/forgot failed:", err.message);
    return ok;
  }
}