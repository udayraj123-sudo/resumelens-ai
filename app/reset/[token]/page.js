import { Suspense } from "react";
import ResetClient from "./ResetClient";

export const metadata = { title: "Reset password | ResumeLens AI" };

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-24 text-center text-slate-400">Loading…</div>}>
      <ResetClient />
    </Suspense>
  );
}