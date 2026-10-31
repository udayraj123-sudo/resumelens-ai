"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CandidateRankings from "@/components/CandidateRankings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(null); // null, "new" ya job ka id
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadJobs() {
    try {
      const res = await fetch("/api/admin/jobs");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error("load failed");
      setJobs(data.jobs);
      setLoadError("");
    } catch {
      setLoadError("Could not load jobs. Please refresh.");
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function openNew() {
    setEditing("new");
    setTitle("");
    setDescription("");
    setSkillsText("");
    setFormError("");
  }

  function openEdit(job) {
    setEditing(job.id);
    setTitle(job.title);
    setDescription(job.description || "");
    setSkillsText(job.skills.join(", "));
    setFormError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const isNew = editing === "new";
      const res = await fetch(
        isNew ? "/api/admin/jobs" : "/api/admin/jobs/" + editing,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            skills: skillsText.split(","),
          }),
        }
      );
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Could not save the job.");
        return;
      }
      setEditing(null);
      await loadJobs();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(job) {
    const ok = window.confirm(
      'Delete "' +
        job.title +
        '"? All applications and resumes for this job will also be deleted. This cannot be undone.'
    );
    if (!ok) return;
    try {
      const res = await fetch("/api/admin/jobs/" + job.id, { method: "DELETE" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        window.alert("Could not delete the job.");
        return;
      }
      if (editing === job.id) setEditing(null);
      await loadJobs();
    } catch {
      window.alert("Network error. Please try again.");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold uppercase tracking-widest sm:text-3xl">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold transition hover:bg-white/10"
        >
          Logout
        </button>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Job Postings</h2>
          {editing === null && (
            <button
              onClick={openNew}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + Add Job
            </button>
          )}
        </div>

        {editing !== null && (
          <form
            onSubmit={handleSave}
            className="mt-6 space-y-4 rounded-xl border border-white/10 bg-black/20 p-5"
          >
            <h3 className="text-base font-bold">
              {editing === "new" ? "Add New Job" : "Edit Job"}
            </h3>

            <div>
              <label htmlFor="jtitle" className="mb-2 block text-sm font-medium text-slate-300">
                Job Title
              </label>
              <input
                id="jtitle"
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Web Developer"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="jdesc" className="mb-2 block text-sm font-medium text-slate-300">
                Description (optional)
              </label>
              <textarea
                id="jdesc"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Build and maintain responsive websites."
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="jskills" className="mb-2 block text-sm font-medium text-slate-300">
                Required Skills
              </label>
              <input
                id="jskills"
                type="text"
                required
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="HTML, CSS, Java, Node.js"
                className={inputClass}
              />
              <p className="mt-2 text-xs text-slate-400">
                Separate skills with commas. Candidates are rated on how many of these their resume shows.
                {editing !== "new" &&
                  " Changing skills does not re-score candidates who already applied."}
              </p>
            </div>

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Job"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loadError && <p className="mt-6 text-sm text-red-400">{loadError}</p>}
        {jobs === null && !loadError && (
          <p className="mt-6 text-sm text-slate-400">Loading jobs...</p>
        )}
        {jobs && jobs.length === 0 && (
          <p className="mt-6 text-sm text-slate-400">
            No jobs yet. Click &ldquo;+ Add Job&rdquo; to create your first opening.
          </p>
        )}

        {jobs && jobs.length > 0 && (
          <ul className="mt-6 space-y-4">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-bold">{job.title}</p>
                    {job.description && (
                      <p className="mt-1 text-sm text-slate-400">{job.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => openEdit(job)}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold transition hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
            <CandidateRankings />
    </section>
  );
}