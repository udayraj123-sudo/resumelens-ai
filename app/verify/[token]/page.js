import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export const metadata = { title: "Confirm email | ResumeLens AI" };

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-24 text-center text-slate-400">Loading…</div>}>
      <VerifyClient />
    </Suspense>
  );
}