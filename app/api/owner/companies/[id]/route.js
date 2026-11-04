import { NextResponse } from "next/server";
import { isOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { createInvite, originFrom } from "@/lib/invites";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Change status (active/inactive), change monthly limit, or make a new invite link.
export async function PATCH(request, { params }) {
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  let body = {};
  try {
    body = await request.json();
  } catch {}

  const supabase = db();
  const { data: company } = await supabase
    .from("companies")
    .select("id,status")
    .eq("id", id)
    .maybeSingle();
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const updates = {};
  if (body.status !== undefined) {
    if (!["active", "inactive"].includes(body.status)) {
      return NextResponse.json({ error: "Bad status" }, { status: 400 });
    }
    if (company.status === "invited" && body.status === "active") {
      return NextResponse.json(
        { error: "This company has not set its password yet" },
        { status: 400 }
      );
    }
    updates.status = body.status;
  }
  if (body.monthly_limit !== undefined) {
    const n = Number(body.monthly_limit);
    if (!Number.isInteger(n) || n < 1 || n > 100000) {
      return NextResponse.json({ error: "Monthly limit must be between 1 and 100000" }, { status: 400 });
    }
    updates.monthly_limit = n;
  }

  if (Object.keys(updates).length) {
    const { error } = await supabase.from("companies").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let inviteUrl;
  if (body.newInvite) {
    const token = await createInvite(supabase, id);
    inviteUrl = `${originFrom(request)}/setup/${token}`;
  }
  return NextResponse.json({ ok: true, inviteUrl });
}