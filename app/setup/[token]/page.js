import { Suspense } from "react";
import SetupClient from "./SetupClient";

export const metadata = { title: "Set your password | ResumeLens AI" };

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-24 text-zinc-400">Loading…</div>}>
      <SetupClient />
    </Suspense>
  );
}