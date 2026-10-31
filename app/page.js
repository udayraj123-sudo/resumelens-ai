import Link from "next/link";

const steps = [
  {
    n: "01",
    title: "Admin posts a job",
    text: "Add the role and the skills you need, like HTML, CSS or Node.js.",
  },
  {
    n: "02",
    title: "Candidate applies",
    text: "Pick a job, share your details and upload your resume as a PDF.",
  },
  {
    n: "03",
    title: "AI rates the profile",
    text: "Skills are matched and every candidate gets a score out of 10 with a reason.",
  },
];

const stats = [
  { value: "/10", label: "Clear AI rating" },
  { value: "100%", label: "Skills checked" },
  { value: "PDF", label: "Resume saved safely" },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-100px] h-[320px] w-[90vw] max-w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[100px] sm:h-[420px] sm:blur-[120px]"
      />

      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-12 pt-14 text-center sm:px-6 sm:pb-16 sm:pt-20 lg:pt-24">
        <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 sm:px-4 sm:text-sm">
          AI-Powered Resume Screening
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:mt-6 sm:text-5xl lg:text-6xl">
          Find the right talent,{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            faster
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base text-gray-400 sm:mt-5 sm:text-lg">
          Candidates apply with their resume. Our AI matches skills to the job
          and rates every profile out of 10, so recruiters see the best people
          first.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/candidate"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-500/25 sm:w-auto"
          >
            I&apos;m a Candidate
          </Link>
          <Link
            href="/admin"
            className="w-full rounded-xl border border-white/10 px-7 py-3 text-center font-semibold text-gray-200 hover:bg-white/5 sm:w-auto"
          >
            Admin Login
          </Link>
        </div>

        <div className="mt-10 grid w-full max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-4 sm:mt-14 sm:py-5">
          {stats.map((s) => (
            <div key={s.label} className="px-2 sm:px-3">
              <p className="text-xl font-bold text-white sm:text-2xl">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
        <h2 className="text-center text-xl font-bold text-white sm:text-2xl">
          How it works
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left sm:p-6"
            >
              <span className="text-sm font-semibold text-indigo-400">
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-white sm:mt-3">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}