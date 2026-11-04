"use client";
import { useCallback, useEffect, useState } from "react";

const input =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400";
const btn =
  "rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50";
const ghost =
  "rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/5 disabled:opacity-50";

export default function OwnerPage() {
  const [authed, setAuthed] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [invite, setInvite] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/owner/companies", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setCompanies(data.companies || []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/owner/logout", { method: "POST" });
    setAuthed(false);
    setCompanies([]);
    setInvite(null);
  }

  if (authed === null) {
    return <div className="mx-auto max-w-5xl px-6 py-20 text-zinc-400">Loading…</div>;
  }
  if (!authed) return <Login onDone={load} />;

  const active = companies.filter((c) => c.status === "active").length;
  const usedTotal = companies.reduce((s, c) => s + c.used, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Owner · control room
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">COMPANIES</h1>
        </div>
        <button onClick={logout} className={ghost}>
          Log out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Companies" value={companies.length} />
        <Stat label="Active" value={active} />
        <Stat label="Applications this month" value={usedTotal} />
      </div>

      {invite && <InviteBox invite={invite} onClose={() => setInvite(null)} />}

      <NewCompany
        onCreated={(company, url) => {
          setInvite({ name: company.name, url });
          load();
        }}
      />

      <div className="mt-8 space-y-4">
        {companies.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            No companies yet. Create the first one above.
          </p>
        )}
        {companies.map((c) => (
          <CompanyCard
            key={c.id}
            c={c}
            onChanged={load}
            onInvite={(url) => setInvite({ name: c.name, url })}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">{label}</p>
    </div>
  );
}

function Login({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/owner/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      setPassword("");
      onDone();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Login failed");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Owner access</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">CONTROL ROOM</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password"
          autoFocus
          className={input}
          placeholder="Owner password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button className={`${btn} w-full`} disabled={busy || !password}>
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

function NewCompany({ onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState(100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/owner/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, monthly_limit: Number(limit) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not create company");
      return;
    }
    setName("");
    setEmail("");
    setLimit(100);
    onCreated(data.company, data.inviteUrl);
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">New company</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1.4fr_0.8fr_auto]">
        <input className={input} placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={input} type="email" placeholder="Company email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="number" min="1" placeholder="Monthly limit" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <button className={btn} disabled={busy || !name || !email}>
          {busy ? "Creating…" : "Create"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </form>
  );
}

function InviteBox({ invite, onClose }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="mt-6 rounded-2xl border border-indigo-400/40 bg-indigo-500/10 p-5">
      <p className="text-sm font-semibold">Invite link for {invite.name}</p>
      <p className="mt-1 text-xs text-zinc-300">
        Send this to the company. It works once, expires in 48 hours, and is shown only now.
      </p>
      <div className="mt-3 flex gap-2">
        <input readOnly className={`${input} font-mono text-xs`} value={invite.url} onFocus={(e) => e.target.select()} />
        <button onClick={copy} className={btn}>
          {copied ? "Copied" : "Copy"}
        </button>
        <button onClick={onClose} className={ghost}>
          Close
        </button>
      </div>
    </div>
  );
}

function CompanyCard({ c, onChanged, onInvite }) {
  const [limit, setLimit] = useState(c.monthly_limit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function patch(body) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/owner/companies/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    if (data.inviteUrl) onInvite(data.inviteUrl);
    onChanged();
  }

  const pct = Math.min(100, Math.round((c.used / c.monthly_limit) * 100));
  const tone =
    c.status === "active"
      ? "bg-emerald-500/15 text-emerald-300"
      : c.status === "invited"
      ? "bg-amber-500/15 text-amber-300"
      : "bg-zinc-500/20 text-zinc-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold">{c.name}</p>
          <p className="text-sm text-zinc-400">{c.email}</p>
          <p className="mt-1 font-mono text-xs text-indigo-300">/c/{c.slug}</p>
        </div>
        <span className={`rounded-full px-3 py-1 font-mono text-xs uppercase ${tone}`}>{c.status}</span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          <span>This month</span>
          <span>
            {c.used} / {c.monthly_limit}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="number"
          min="1"
          className="w-28 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <button
          className={ghost}
          disabled={busy || Number(limit) === c.monthly_limit}
          onClick={() => patch({ monthly_limit: Number(limit) })}
        >
          Save limit
        </button>
        {c.status === "active" && (
          <button className={ghost} disabled={busy} onClick={() => patch({ status: "inactive" })}>
            Pause
          </button>
        )}
        {c.status === "inactive" && (
          <button className={ghost} disabled={busy} onClick={() => patch({ status: "active" })}>
            Activate
          </button>
        )}
        <button className={ghost} disabled={busy} onClick={() => patch({ newInvite: true })}>
          New invite link
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}