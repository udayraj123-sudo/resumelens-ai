// Cleans and validates a job sent from the browser.
export function cleanJob(body) {
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  let skills = Array.isArray(body?.skills) ? body.skills : String(body?.skills || "").split(",");
  skills = [...new Set(skills.map((s) => String(s).trim()).filter(Boolean))];

  if (title.length < 2 || title.length > 100) return { error: "Job title must be 2-100 characters" };
  if (description.length > 4000) return { error: "Description is too long (max 4000 characters)" };
  if (skills.length < 1 || skills.length > 30) return { error: "Add 1 to 30 skills" };
  if (skills.some((s) => s.length > 40)) return { error: "Each skill must be 40 characters or less" };
  return { value: { title, description, skills } };
}