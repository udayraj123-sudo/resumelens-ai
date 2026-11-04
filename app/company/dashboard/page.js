"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400";
const btn =
  "rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50";
const ghost =
  "rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/5 disabled:opacity-50";

export default function CompanyDashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState("candidates");
  const [jobFilter, setJobFilter] = useState("all");

  const load = useCallback(async () => {
    const [m, j, a] = await Promise.all([
      fetch("/api/company/me", { cache: "no-store" }),
      fetch("/api/company/jobs", { cache: "no-store" }),
      fetch("/api/company/applications", { cache: "no-store" }),
    ]);
    if (m.status === 401) {
      router.push("/company/login");
      return;
    }
    setMe((await m.json()).company);
    setJobs((await j.json()).jobs || []);
    setApps((await a.json()).applications || []);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/company/logout", { method: "POST" });
    router.push("/company/login");
  }

  if (!me) return <div className="mx-auto max-w-5xl px-6 py-20 text-zinc-400">Loading…</div>;

  const pct = Math.min(100, Math.round((me.used / me.monthly_limit) * 100));
  const link = typeof window !== "undefined" ? `${window.location.origin}/c/${me.slug}` : `/c/${me.slug}`;
  const shown = apps
    .filter((a) => jobFilter === "all" || a.job_id === jobFilter)
    .sort((x, y) => (y.score ?? -1) - (x.score ?? -1));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Company dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{me.name}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Candidate link: <span className="font-mono text-indigo-300">{link}</span>{" "}
            <button className="ml-1 text-xs underline" onClick={() => navigator.clipboard?.writeText(link)}>
              copy
            </button>
          </p>
        </div>
        <button onClick={logout} className={ghost}>
          Log out
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          <span>Applications this month</span>
          <span>
            {me.used} / {me.monthly_limit}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {["candidates", "jobs"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              tab === t ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t} {t === "candidates" ? `(${apps.length})` : `(${jobs.length})`}
          </button>
        ))}
      </div>

      {tab === "candidates" && (
        <div className="mt-4">
          <select className={`${input} max-w-xs`} value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
            <option value="all">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <div className="mt-4 space-y-3">
            {shown.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                No candidates yet. Share your candidate link.
              </p>
            )}
            {shown.map((a) => (
              <Candidate key={a.id} a={a} onChanged={load} />
            ))}
          </div>
        </div>
      )}

      {tab === "jobs" && <Jobs jobs={jobs} onChanged={load} />}
    </div>
  );
}

function Score({ value }) {
  if (value === null || value === undefined) return <span className="text-zinc-500">—</span>;
  const tone = value >= 7 ? "bg-emerald-500/15 text-emerald-300" : value >= 5 ? "bg-amber-500/15 text-amber-300" : "bg-rose-500/15 text-rose-300";
  return <span className={`rounded-xl px-3 py-2 text-lg font-extrabold ${tone}`}>{Number(value).toFixed(1)}</span>;
}

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nextMonday() {
  const d = new Date();
  d.setDate(d.getDate() + (((8 - d.getDay()) % 7) || 7));
  return isoDate(d);
}
function inDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

function Candidate({ a, onChanged }) {
  const [hiring, setHiring] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold">
            {a.name}{" "}
            {a.status === "hired" && (
              <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 align-middle text-xs text-emerald-300">Hired</span>
            )}
          </p>
          <p className="text-sm text-zinc-400">
            {a.email}
            {a.phone ? ` · ${a.phone}` : ""}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Applied for {a.job_title}
            {a.status === "hired" && a.joining_date ? ` · Joining ${a.joining_date}` : ""}
          </p>
        </div>
        <Score value={a.score} />
      </div>
      {a.reason && <p className="mt-3 text-sm text-zinc-300">{a.reason}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {(a.matched_skills || []).map((s) => (
          <span key={`m${s}`} className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">{s}</span>
        ))}
        {(a.missing_skills || []).map((s) => (
          <span key={`x${s}`} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-400 line-through">{s}</span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {a.has_resume && (
          <a className={ghost} href={`/api/company/applications/${a.id}/resume`} target="_blank" rel="noreferrer">
            View resume
          </a>
        )}
        {a.status !== "hired" && (
          <button className={btn} onClick={() => setHiring(true)}>
            Hire
          </button>
        )}
      </div>
      {hiring && (
        <HireModal
          a={a}
          onClose={() => setHiring(false)}
          onDone={() => {
            setHiring(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function HireModal({ a, onClose, onDone }) {
  const [choice, setChoice] = useState("monday");
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const date = choice === "monday" ? nextMonday() : choice === "week" ? inDays(7) : custom;

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/company/applications/${a.id}/hire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joiningDate: date, message }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Failed");
    onDone();
  }

  const opt = (key, label) => (
    <button
      type="button"
      onClick={() => setChoice(key)}
      className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
        choice === key ? "border-indigo-400 bg-indigo-500/20 text-white" : "border-white/10 text-zinc-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
        <h3 className="text-xl font-bold">Hire {a.name}</h3>
        <p className="mt-1 text-sm text-zinc-400">
          An email will be sent to {a.email} for {a.job_title}.
        </p>

        <p className="mt-5 font-mono text-xs uppercase tracking-wider text-zinc-400">Joining date</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {opt("monday", "Next Monday")}
          {opt("week", "In 7 days")}
          {opt("custom", "Pick a date")}
        </div>
        {choice === "custom" ? (
          <input type="date" className={`${input} mt-3`} min={isoDate(new Date())} value={custom} onChange={(e) => setCustom(e.target.value)} />
        ) : (
          <p className="mt-2 text-sm text-zinc-300">{date}</p>
        )}

        <p className="mt-5 font-mono text-xs uppercase tracking-wider text-zinc-400">Message (optional)</p>
        <textarea
          rows={3}
          maxLength={500}
          className={`${input} mt-2`}
          placeholder="e.g. Please bring your original documents on day one."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button className={ghost} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className={btn} onClick={submit} disabled={busy || !date}>
            {busy ? "Sending…" : "Hire and send email"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Jobs({ jobs, onChanged }) {
  const empty = { id: null, title: "", description: "", skills: "" };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(form.id ? `/api/company/jobs/${form.id}` : "/api/company/jobs", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, description: form.description, skills: form.skills }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not save");
    setForm(empty);
    onChanged();
  }

  async function remove(id) {
    if (!confirm("Delete this job? Its candidates will also be deleted.")) return;
    await fetch(`/api/company/jobs/${id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="mt-4">
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">{form.id ? "Edit job" : "Add job"}</p>
        <div className="mt-3 grid gap-3">
          <input className={input} placeholder="Job title (e.g. Web Developer)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={input} placeholder="Required skills, comma separated (HTML, CSS, Node.js)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <textarea rows={3} className={input} placeholder="Short description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button className={btn} disabled={busy || !form.title || !form.skills}>
            {busy ? "Saving…" : form.id ? "Save changes" : "Add job"}
          </button>
          {form.id && (
            <button type="button" className={ghost} onClick={() => setForm(empty)}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{j.title}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(j.skills || []).map((s) => (
                    <span key={s} className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className={ghost}
                  onClick={() => setForm({ id: j.id, title: j.title, description: j.description || "", skills: (j.skills || []).join(", ") })}
                >
                  Edit
                </button>
                <button className={ghost} onClick={() => remove(j.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}