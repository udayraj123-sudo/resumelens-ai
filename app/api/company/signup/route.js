import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, slugify } from "@/lib/security";
import { allow, clientIp } from "@/lib/rateLimit";
import { createAuthToken } from "@/lib/authTokens";
import { sendAuthMail } from "@/lib/authMail";
import { originFrom } from "@/lib/invites";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOCKED = [
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
];

function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    const supabase = db();

    // 5 sign ups per hour from one network
    if (!(await allow(supabase, "signup:" + clientIp(request), 5, 3600))) {
      return bad("Too many sign up attempts. Please try again later.", 429);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {}

    // hidden field that only bots fill in
    if (body.website) return NextResponse.json({ ok: true });

    const name = String(body.name || "")
      .replace(/[\u0000-\u001f<>]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (name.length < 2 || name.length > 80) return bad("Please enter your company name (2 to 80 characters).");
    if (!EMAIL_RE.test(email) || email.length > 200) return bad("Please enter a valid email address.");
    if (BLOCKED.includes(email.split("@")[1])) return bad("Please use your real company email address.");
    if (password.length < 8 || password.length > 72) return bad("Password must be 8 to 72 characters.");
    if (body.agree !== true) return bad("Please accept the Privacy Policy and Terms.");

    const { data: existing } = await supabase.from("companies").select("id").eq("email", email).maybeSingle();
    if (existing) return bad("An account with this email already exists. Please log in.", 409);

    // unique link name, like /c/acme, /c/acme-2
    let base = (slugify(name) || "company").slice(0, 40).replace(/-+$/, "") || "company";
    let slug = base;
    for (let i = 2; i < 12; i++) {
      const { data: taken } = await supabase.from("companies").select("id").eq("slug", slug).maybeSingle();
      if (!taken) break;
      slug = `${base}-${i}`;
    }

    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        name,
        slug,
        email,
        password_hash: hashPassword(password),
        status: "active",
        monthly_limit: 100,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return bad("An account with this email already exists. Please log in.", 409);
      throw error;
    }

    const token = await createAuthToken(supabase, company.id, "verify");
    const link = originFrom(request).replace(/\/$/, "") + "/verify/" + token;

    let mailFailed = false;
    try {
      await sendAuthMail({ to: email, kind: "verify", companyName: name, link });
    } catch (err) {
      console.error("Verify email failed:", err.message);
      mailFailed = true;
    }

    // tell the owner (best effort, never blocks the sign up)
    sendAuthMail({ to: process.env.GMAIL_USER, kind: "owner", companyName: name, email }).catch(() => {});

    return NextResponse.json({ ok: true, mailFailed });
  } catch (err) {
    console.error("POST /api/company/signup failed:", err.message);
    return bad("Something went wrong. Please try again.", 500);
  }
}