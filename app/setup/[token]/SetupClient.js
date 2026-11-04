"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const input =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400";

export default function SetupClient() {
  const { token } = useParams();
  const router = useRouter();
  const [state, setState] = useState({ loading: true });
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/company/setup?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then(({ ok, data }) =>
        setState(ok ? { loading: false, name: data.companyName } : { loading: false, bad: data.error })
      );
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (pw.length < 10) return setError("Use at least 10 characters.");
    if (pw !== pw2) return setError("The two passwords do not match.");
    setBusy(true);
    const res = await fetch("/api/company/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Something went wrong.");
    router.push("/company/dashboard");
  }

  if (state.loading) return <div className="mx-auto max-w-md px-6 py-24 text-zinc-400">Checking your link…</div>;

  if (state.bad) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-2xl font-extrabold">Link problem</h1>
        <p className="mt-3 text-zinc-300">{state.bad}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Welcome</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{state.name}</h1>
      <p className="mt-3 text-sm text-zinc-300">
        Choose a password for your ResumeLens AI account. Only you will know it — it is stored
        scrambled and nobody, including the site owner, can read it.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="password" className={input} placeholder="New password (10+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} />
        <input type="password" className={input} placeholder="Repeat password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          disabled={busy || !pw || !pw2}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Set password and continue"}
        </button>
      </form>
    </div>
  );
}