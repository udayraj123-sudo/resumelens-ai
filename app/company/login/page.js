"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30";
const primary =
  "w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60";
const secondary = "w-full rounded-full border bg-white/5 px-6 py-3 text-sm font-semibold transition";

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export default function CompanyAuthPage() {
  const router = useRouter();
  // login | signup | forgot | check
  const [view, setView] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [trap, setTrap] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [checkKind, setCheckKind] = useState("verify");
  const [cool, setCool] = useState(0);

  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  function go(next) {
    setView(next);
    setError("");
    setInfo("");
    setUnverified(false);
  }

  async function submitLogin(e) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setBusy(true);
    try {
      const { ok, data } = await post("/api/company/login", { email, password });
      if (ok) return router.push("/company/dashboard");
      setError(data.error || "Could not log in.");
      if (data.code === "unverified") setUnverified(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitSignup(e) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter your company name.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");
    if (!agree) return setError("Please accept the Privacy Policy and Terms.");
    setBusy(true);
    try {
      const { ok, data } = await post("/api/company/signup", { name, email, password, agree, website: trap });
      if (!ok) return setError(data.error || "Could not create the account.");
      setCheckKind("verify");
      setInfo(
        data.mailFailed
          ? "Your account was created, but we could not send the email. Press Resend below."
          : "We sent a confirmation link to your email. Open it to activate your account."
      );
      setCool(30);
      setView("check");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitForgot(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { ok, data } = await post("/api/company/forgot", { email });
      if (!ok) return setError(data.error || "Something went wrong.");
      setCheckKind("reset");
      setInfo("If an account exists for this email, we sent a link to reset the password.");
      setCool(30);
      setView("check");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (cool > 0) return;
    setError("");
    setBusy(true);
    try {
      const url = checkKind === "reset" ? "/api/company/forgot" : "/api/company/resend";
      const { ok, data } = await post(url, { email });
      if (!ok) setError(data.error || "Please try again later.");
      else setInfo("Sent again. Please check your inbox and spam folder.");
      setCool(60);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const titles = {
    login: "Company login",
    signup: "Create your company account",
    forgot: "Forgot your password?",
    check: "Check your email",
  };
  const subtitles = {
    login: "Log in to post jobs and review candidates.",
    signup: "Free to start. You can post jobs and receive applications in minutes.",
    forgot: "Enter your email and we will send you a reset link.",
    check: "",
  };

  return (
    <section className="mx-auto max-w-md px-6 py-14">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Company portal</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{titles[view]}</h1>
        {subtitles[view] && <p className="mt-2 text-sm text-slate-400">{subtitles[view]}</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        {view === "login" && (
          <>
            <form onSubmit={submitLogin} className="space-y-4">
              <input type="email" required className={input} placeholder="Company email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <div className="relative">
                <input type={show ? "text" : "password"} required className={input} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {unverified && (
                <button type="button" onClick={() => { setCheckKind("verify"); setInfo(""); setCool(0); setView("check"); }} className="text-sm font-semibold text-indigo-300 underline">
                  Resend the confirmation email
                </button>
              )}
              <button type="submit" disabled={busy} className={primary}>
                {busy ? "Logging in…" : "Log in"}
              </button>
              <button type="button" onClick={() => go("forgot")} className="block w-full text-center text-sm text-slate-400 underline">
                Forgot your password?
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              New to ResumeLens AI?
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <button type="button" onClick={() => go("signup")} className={secondary}>
              Create company account
            </button>
          </>
        )}

        {view === "signup" && (
          <>
            <form onSubmit={submitSignup} className="space-y-4">
              <input type="text" required maxLength={80} className={input} placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" />
              <input type="email" required className={input} placeholder="Company email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <div className="relative">
                <input type={show ? "text" : "password"} required className={input} placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              <input type={show ? "text" : "password"} required className={input} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              {/* hidden field: only bots fill this */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
              <label className="flex items-start gap-3 text-sm text-slate-400">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4" />
                <span>
                  I agree to the{" "}
                  <Link href="/privacy" target="_blank" className="underline">Privacy Policy</Link> and{" "}
                  <Link href="/terms" target="_blank" className="underline">Terms of Service</Link>.
                </span>
              </label>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={busy} className={primary}>
                {busy ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              Already have an account?
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <button type="button" onClick={() => go("login")} className={secondary}>
              Log in
            </button>
          </>
        )}

        {view === "forgot" && (
          <form onSubmit={submitForgot} className="space-y-4">
            <input type="email" required className={input} placeholder="Company email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={busy} className={primary}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <button type="button" onClick={() => go("login")} className={secondary}>
              Back to login
            </button>
          </form>
        )}

        {view === "check" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-400">
              ✉
            </div>
            {email && <p className="text-sm text-slate-300">{email}</p>}
            <p className="text-sm text-slate-400">
              {info || "Enter your email on the login page and press Resend if you did not get the email."}
            </p>
            {!email && (
              <input type="email" className={input} placeholder="Your company email" value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <p className="text-xs text-slate-500">Cannot find it? Check your spam folder.</p>
            <button type="button" onClick={resend} disabled={busy || cool > 0 || !email} className={secondary}>
              {cool > 0 ? `Resend in ${cool}s` : "Resend email"}
            </button>
            <button type="button" onClick={() => go("login")} className={secondary}>
              Back to login
            </button>
          </div>
        )}
      </div>
    </section>
  );
}