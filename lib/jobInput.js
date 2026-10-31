export function parseJobInput(body) {
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const raw = Array.isArray(body?.skills) ? body.skills : [];

  const seen = new Set();
  const skills = [];
  for (const s of raw) {
    const skill = String(s).trim();
    const key = skill.toLowerCase();
    if (skill && skill.length <= 40 && !seen.has(key)) {
      seen.add(key);
      skills.push(skill);
    }
  }

  if (!title) return { error: "Job title is required." };
  if (title.length > 100) return { error: "Job title is too long." };
  if (description.length > 1000) {
    return { error: "Description is too long (max 1000 characters)." };
  }
  if (skills.length === 0) return { error: "Add at least one required skill." };
  if (skills.length > 20) return { error: "Maximum 20 skills allowed." };

  return { value: { title, description: description || null, skills } };
}