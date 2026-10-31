"use client";

import { useCallback, useEffect, useState } from "react";
import HireModal from "./HireModal";

function scoreStyle(score) {
  if (score === null || score === undefined)
    return "bg-gray-500/15 text-gray-300 border-gray-500/30";
  if (score >= 8) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (score >= 5) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-red-500/15 text-red-300 border-red-500/30";
}

function normalize(a) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    score: a.score === null || a.score === undefined ? null : Number(a.score),
    matched: a.matchedSkills || a.matched_skills || [],
    missing: a.missingSkills || a.missing_skills || [],
    reason: a.reason,
    status: a.status,
    jobTitle: a.jobTitle || a.job_title || a.jobs?.title || "Unknown job",
    joiningDate: a.joiningDate || a.joining_date || null,
  };
}

export default function CandidateRankings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [hiring, setHiring] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/applications");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load candidates.");
      } else {
        const list = Array.isArray(data) ? data : data.applications || [];
        setItems(list.map(normalize));
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const jobTitles = [...new Set(items.map((i) => i.jobTitle))];
  const shown = filter === "all" ? items : items.filter((i) => i.jobTitle === filter);

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Candidate Rankings</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="all">All jobs</option>
            {jobTitles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="mt-6 text-gray-400">Loading candidates...</p>}
      {error && <p className="mt-6 text-red-300">{error}</p>}
      {!loading && !error && shown.length === 0 && (
        <p className="mt-6 text-gray-400">No candidates yet.</p>
      )}

      <ul className="mt-6 space-y-4">
        {shown.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                  <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs text-indigo-300">
                    {c.jobTitle}
                  </span>
                  {c.status === "hired" && (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      Hired
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  {c.email}
                  {c.phone ? ` • ${c.phone}` : ""}
                </p>
                {c.status === "hired" && c.joiningDate && (
                  <p className="mt-1 text-sm text-emerald-300/80">
                    Joining: {c.joiningDate}
                  </p>
                )}
              </div>

              <div
                className={`rounded-xl border px-4 py-2 text-center ${scoreStyle(c.score)}`}
              >
                {c.score === null ? (
                  <span className="text-sm font-semibold">Not scored</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold">{c.score.toFixed(1)}</span>
                    <span className="text-sm opacity-70"> / 10</span>
                  </>
                )}
              </div>
            </div>

            {(c.matched.length > 0 || c.missing.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {c.matched.map((s) => (
                  <span
                    key={"m" + s}
                    className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                  >
                    ✓ {s}
                  </span>
                ))}
                {c.missing.map((s) => (
                  <span
                    key={"x" + s}
                    className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-300"
                  >
                    ✗ {s}
                  </span>
                ))}
              </div>
            )}

            {c.reason && (
              <p className="mt-3 text-sm italic text-gray-400">{c.reason}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`/api/admin/applications/${c.id}/resume`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
              >
                View Resume
              </a>
              {c.status !== "hired" && (
                <button
                  onClick={() => setHiring(c)}
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Hire
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hiring && (
        <HireModal
          app={hiring}
          onClose={() => setHiring(null)}
          onDone={() => {
            setHiring(null);
            load();
          }}
        />
      )}
    </section>
  );
}