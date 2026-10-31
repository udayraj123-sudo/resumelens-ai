"use client";

import { useState } from "react";

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function suggestedMonday() {
  const today = new Date();
  const dow = today.getDay(); // 0 = Sunday
  let add = (8 - dow) % 7;
  if (add === 0) add = 7;
  if (add < 3) add += 7;
  const d = new Date(today);
  d.setDate(today.getDate() + add);
  return d;
}

function pretty(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HireModal({ app, onClose, onDone }) {
  const monday = toISO(suggestedMonday());
  const sevenDays = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toISO(d);
  })();

  const [option, setOption] = useState("monday");
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const joiningDate =
    option === "monday" ? monday : option === "seven" ? sevenDays : custom;

  async function submit() {
    setError("");
    if (!joiningDate) {
      setError("Please choose a joining date.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/applications/${app.id}/hire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joiningDate, message: message.trim() }),
      });
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      onDone();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  const optionClass = (active) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
      active
        ? "border-indigo-500 bg-indigo-500/10"
        : "border-white/10 hover:border-white/20"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d16] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Hire {app.name}</h2>
        <p className="mt-1 text-sm text-gray-400">
          An acceptance email will be sent to{" "}
          <span className="text-gray-200">{app.email}</span>.
        </p>

        <p className="mt-5 text-sm font-semibold text-gray-200">Joining date</p>
        <div className="mt-2 space-y-2">
          <label className={optionClass(option === "monday")}>
            <input
              type="radio"
              checked={option === "monday"}
              onChange={() => setOption("monday")}
              className="mt-1"
            />
            <span>
              <span className="font-semibold text-white">
                Next Monday (recommended)
              </span>
              <br />
              <span className="text-gray-400">{pretty(monday)}</span>
            </span>
          </label>

          <label className={optionClass(option === "seven")}>
            <input
              type="radio"
              checked={option === "seven"}
              onChange={() => setOption("seven")}
              className="mt-1"
            />
            <span>
              <span className="font-semibold text-white">7 days from today</span>
              <br />
              <span className="text-gray-400">{pretty(sevenDays)}</span>
            </span>
          </label>

          <label className={optionClass(option === "custom")}>
            <input
              type="radio"
              checked={option === "custom"}
              onChange={() => setOption("custom")}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="font-semibold text-white">Custom date</span>
              {option === "custom" && (
                <input
                  type="date"
                  value={custom}
                  min={toISO(new Date())}
                  onChange={(e) => setCustom(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                />
              )}
            </span>
          </label>
        </div>

        <p className="mt-5 text-sm font-semibold text-gray-200">
          Personal message <span className="font-normal text-gray-500">(optional)</span>
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="e.g. We were impressed by your projects. Looking forward to working with you!"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-gray-600"
        />
        <p className="text-right text-xs text-gray-500">{message.length}/500</p>

        {error && (
          <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Sending..." : "Hire & Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}