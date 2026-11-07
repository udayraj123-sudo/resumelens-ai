"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyClient() {
  const { token } = useParams();
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState("working");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetch("/api/company/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (ok) {
          setState("done");
          setTimeout(() => router.push(data.active ? "/company/dashboard" : "/company/login"), 1500);
        } else {
          setState("error");
          setMessage(data.error || "Something went wrong.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Network error. Please try again.");
      });
  }, [token, router]);

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        {state === "working" && (
          <>
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-indigo-400" />
            <h1 className="text-xl font-bold">Confirming your email…</h1>
          </>
        )}
        {state === "done" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-400">
              ✓
            </div>
            <h1 className="text-xl font-bold">Email confirmed</h1>
            <p className="mt-2 text-sm text-slate-400">Taking you to your dashboard…</p>
          </>
        )}
        {state === "error" && (
          <>
            <h1 className="text-xl font-bold">Could not confirm</h1>
            <p className="mt-2 text-sm text-slate-400">{message}</p>
            <Link
              href="/company/login"
              className="mt-6 inline-block rounded-full border bg-white/5 px-6 py-3 text-sm font-semibold"
            >
              Go to login
            </Link>
          </>
        )}
      </div>
    </section>
  );
}