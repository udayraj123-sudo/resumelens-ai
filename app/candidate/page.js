"use client";

import { useEffect, useRef, useState } from "react";

const MAX_MB = 4;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30";

function formatDate(value, utc = false) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(utc ? { timeZone: "UTC" } : {}),
  });
}

export default function CandidatePage() {
  const fileInputRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [jobsError, setJobsError] = useState("");
  const [jobId, setJobId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusEmail, setStatusEmail] = useState("");
  const [statusResults, setStatusResults] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => {
        if (d.jobs) setJobs(d.jobs);
        else setJobsError("Could not load jobs. Please refresh.");
      })
      .catch(() => setJobsError("Could not load jobs. Please refresh."));
  }, []);

  function pickFile(f) {
    setError("");
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError("File must be " + MAX_MB + "MB or smaller.");
      return;
    }
    setFile(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!jobId) {
      setError("Please select a job.");
      return;
    }
    if (!file) {
      setError("Please upload your resume (PDF).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body = new FormData();
      body.append("jobId", jobId);
      body.append("name", name);
      body.append("email", email);
      body.append("phone", phone);
      body.append("resume", file);

      const res = await fetch("/api/apply", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setJobId("");
    setName("");
    setEmail("");
    setPhone("");
    setFile(null);
    setError("");
    setSubmitted(false);
  }

  async function handleStatusCheck(e) {
    e.preventDefault();
    setStatusLoading(true);
    setStatusError("");
    setStatusResults(null);
    try {
      const res = await fetch("/api/status?email=" + encodeURIComponent(statusEmail));
      const data = await res.json();
      if (!res.ok) setStatusError(data.error || "Could not check status.");
      else setStatusResults(data.applications);
    } catch {
      setStatusError("Network error. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      {loading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-indigo-400" />
          <p className="text-sm font-medium text-slate-200">Analyzing Resume...</p>
        </div>
      )}

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Candidate Portal
        </h1>
        <p className="mt-3 text-slate-400">
          Apply for open roles by selecting a job and uploading your resume.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-400">
            ✓
          </div>
          <h2 className="text-2xl font-bold">Profile Submitted!</h2>
          <p className="mt-3 text-slate-400">
            Your resume has been successfully uploaded. You are now in our talent
            pool.
          </p>
          <button
            onClick={resetForm}
            className="mt-8 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            Upload Another Resume
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="job" className="mb-2 block text-sm font-medium text-slate-300">
              Select Job to Apply For
            </label>
            <select
              id="job"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className={inputClass}
            >
              <option value="">
                {jobs.length === 0 && !jobsError ? "Loading jobs..." : "Choose a job..."}
              </option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            {jobsError && <p className="mt-2 text-sm text-red-400">{jobsError}</p>}
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rohan Yadav"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohan@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-300">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Resume (PDF)</p>
            {file ? (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-4 text-sm font-medium text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition " +
                  (dragging
                    ? "border-indigo-400 bg-indigo-500/10"
                    : "border-white/15 bg-white/[0.02]")
                }
              >
                <p className="text-base font-semibold">Drag &amp; Drop Resume</p>
                <p className="mt-1 text-xs text-slate-400">
                  Supports PDF files up to {MAX_MB}MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="mt-4 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold transition hover:bg-white/10"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files[0])}
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90 disabled:opacity-60"
          >
            Submit Profile
          </button>
        </form>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-bold">Check Application Status</h2>
        <form onSubmit={handleStatusCheck} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={statusEmail}
            onChange={(e) => {
              setStatusEmail(e.target.value);
              setStatusResults(null);
              setStatusError("");
            }}
            placeholder="Enter your email address"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={statusLoading}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-60 sm:whitespace-nowrap"
          >
            {statusLoading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {statusError && <p className="mt-4 text-sm text-red-400">{statusError}</p>}

        {statusResults && statusResults.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No applications found for this email.
          </p>
        )}

        {statusResults && statusResults.length > 0 && (
          <ul className="mt-5 space-y-3">
            {statusResults.map((a, i) => (
              <li
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{a.jobTitle}</p>
                  <p className="text-xs text-slate-400">
                    Applied on {formatDate(a.appliedOn)}
                  </p>
                </div>
                {a.status === "hired" ? (
                  <div className="text-left sm:text-right">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                      Hired
                    </span>
                    {a.joiningDate && (
                      <p className="mt-1 text-xs text-slate-400">
                        Joining on {formatDate(a.joiningDate, true)}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="w-fit rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
                                        Under Review
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}