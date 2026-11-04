export const metadata = { title: "Privacy Policy | ResumeLens AI" };

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Legal</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-400">Last updated: November 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-slate-300">
        <div>
          <h2 className="text-lg font-bold text-white">1. What ResumeLens AI is</h2>
          <p className="mt-2">
            ResumeLens AI is a hiring platform used by multiple companies. Each company has its own
            page where candidates can apply for open roles. A company can only see the applications
            sent to its own page.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">2. Information we collect</h2>
          <p className="mt-2">
            When you apply, we collect your name, email address, optional phone number, the job you
            applied for and the resume (PDF) you upload. When a company signs up, we collect the
            company name, a contact email and a password (stored in a hashed form, never in plain text).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">3. How your information is used</h2>
          <p className="mt-2">
            Your application is shared only with the company you applied to. Your resume is read by an
            AI service to score how well it matches the job and to show the company a short summary.
            The score is a guide for the company and is not a final hiring decision. If a company
            selects you, an email is sent to the address you provided on that company&apos;s behalf.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">4. Storage and security</h2>
          <p className="mt-2">
            Resumes are stored in private storage and are opened only through short-lived links for the
            company that received the application. Access to company accounts is protected by a
            password and login attempts are limited. No system is completely secure, but we work to
            protect your information.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">5. Sharing</h2>
          <p className="mt-2">
            We do not sell your information. It is processed by the services that run this platform
            (hosting, database storage, AI analysis and email delivery) only to provide the features
            described above.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">6. Retention and deletion</h2>
          <p className="mt-2">
            Your application is kept for as long as the company keeps it. You can ask for your resume
            and details to be deleted by contacting the company you applied to, or by writing to us
            using the Contact Support link in the footer. We will remove them on request.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">7. Changes</h2>
          <p className="mt-2">
            We may update this policy from time to time. The latest version will always be on this page.
          </p>
        </div>
      </div>
    </section>
  );
}