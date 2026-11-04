import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeResume } from "@/lib/analyze";
import { getCompanyBySlug } from "@/lib/companyPublic";
import { getUsage } from "@/lib/usage";

export const maxDuration = 60;

const MAX_SIZE = 4 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const supabase = db();

    const company = await getCompanyBySlug(supabase, slug);
    if (!company) return bad("Company not found.", 404);
    if (company.status !== "active") return bad("This company is not accepting applications right now.", 403);

    // monthly limit (protects the shared AI quota)
    const used = await getUsage(supabase, company.id);
    if (used >= company.monthly_limit) {
      return bad("This company has reached its application limit for this month. Please try again next month.", 429);
    }

    const form = await request.formData();
    const jobId = String(form.get("jobId") || "");
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const phone = String(form.get("phone") || "").trim();
    const file = form.get("resume");

    if (!UUID_RE.test(jobId)) return bad("Please select a job.");
    if (!name || name.length > 100) return bad("Please enter your name.");
    if (!EMAIL_RE.test(email)) return bad("Please enter a valid email.");
    if (!file || typeof file === "string") return bad("Please upload your resume.");
    if (file.size > MAX_SIZE) return bad("Resume must be 4MB or smaller.");

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 4).toString() !== "%PDF") return bad("Only PDF files are supported.");

    // the job must belong to THIS company
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, description, skills")
      .eq("id", jobId)
      .eq("company_id", company.id)
      .maybeSingle();
    if (!job) return bad("This job is no longer available.", 404);

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("company_id", company.id)
      .eq("job_id", jobId)
      .eq("email", email)
      .maybeSingle();
    if (existing) return bad("You have already applied for this job.", 409);

    const resumePath = `${company.id}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(resumePath, buffer, { contentType: "application/pdf" });
    if (uploadError) throw uploadError;

    let analysis = null;
    try {
      analysis = await analyzeResume({
        pdfBuffer: buffer,
        jobTitle: job.title,
        jobDescription: job.description,
        skills: job.skills || [],
      });
    } catch (err) {
      console.error("Resume analysis failed:", err.message);
    }

    const { error: insertError } = await supabase.from("applications").insert({
      company_id: company.id,
      job_id: jobId,
      name,
      email,
      phone: phone || null,
      resume_path: resumePath,
      score: analysis ? analysis.score : null,
      matched_skills: analysis ? analysis.matchedSkills : [],
      missing_skills: analysis ? analysis.missingSkills : [],
      reason: analysis ? analysis.reason : null,
    });
    if (insertError) {
      await supabase.storage.from("resumes").remove([resumePath]);
      throw insertError;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/c/[slug]/apply failed:", err.message);
    return bad("Something went wrong. Please try again.", 500);
  }
}