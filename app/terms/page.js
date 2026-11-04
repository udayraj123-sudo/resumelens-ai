export const metadata = { title: "Terms of Service | ResumeLens AI" };

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Legal</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-slate-400">Last updated: November 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-slate-300">
        <div>
          <h2 className="text-lg font-bold text-white">1. Using the platform</h2>
          <p className="mt-2">
            ResumeLens AI lets companies publish jobs and review applications, and lets candidates apply
            to those jobs. By using the platform you agree to these terms.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">2. For candidates</h2>
          <p className="mt-2">
            Please provide accurate information and upload only your own resume. Do not upload files that
            contain harmful content. Applications may be limited to prevent misuse.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">3. For companies</h2>
          <p className="mt-2">
            Companies are responsible for the jobs they post and for how they use candidate information.
            Candidate details must be used only for hiring and must be kept private. Keep your login
            details safe and do not share your account.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">4. AI scores</h2>
          <p className="mt-2">
            Scores and summaries are produced by an AI service and may contain mistakes. They are only a
            guide for the company and are not a final hiring decision.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">5. Limits and fair use</h2>
          <p className="mt-2">
            Each company has a monthly application limit. We may limit requests, or pause an account,
            if the platform is misused or if there is suspicious activity.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">6. Availability</h2>
          <p className="mt-2">
            The platform is provided as is. We try to keep it running but do not guarantee that it will
            always be available or error free.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">7. Contact</h2>
          <p className="mt-2">
            For questions about these terms or to request deletion of your data, use the Contact Support
            link in the footer.
          </p>
        </div>
      </div>
    </section>
  );
}