"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400";

export default function CompanyLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/company/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Login failed");
    router.push("/company/dashboard");
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Company login</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sign in</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" className={input} placeholder="Company email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className={input} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          disabled={busy || !email || !password}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}