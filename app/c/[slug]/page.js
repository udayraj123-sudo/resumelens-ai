import { Suspense } from "react";
import CandidateClient from "./CandidateClient";

export const metadata = { title: "Apply | ResumeLens AI" };

export default function CompanyCandidatePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-24 text-slate-400">Loading…</div>}>
      <CandidateClient />
    </Suspense>
  );
}