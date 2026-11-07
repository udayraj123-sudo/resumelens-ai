import Link from "next/link";

const steps = [
  {
    n: "01",
    title: "Create your company account",
    text: "Sign up with your company email and confirm it. It takes under a minute.",
  },
  {
    n: "02",
    title: "Post a job and share your link",
    text: "Every company gets its own public page. Share it anywhere candidates look.",
  },
  {
    n: "03",
    title: "Review ranked candidates",
    text: "AI reads each resume, scores it against your job and shows the best matches first.",
  },
];

const features = [
  {
    title: "AI resume scoring",
    text: "Every resume is read and matched to the job so you see fit, strengths and gaps at a glance.",
  },
  {
    title: "Your own candidate page",
    text: "A clean public page with only your open jobs. Candidates apply without creating accounts.",
  },
  {
    title: "One click hire email",
    text: "Send a branded offer or interview email to a candidate directly from your dashboard.",
  },
  {
    title: "Private by design",
    text: "Your candidates and resumes are visible only to your company. Nobody else can see them.",
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center sm:pt-28">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">
          AI hiring assistant
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Find the right candidate, <span className="text-indigo-400">faster</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          ResumeLens AI reads every resume, scores it against your job and shows you the best
          people first. Built for small teams who do not have time to read hundreds of CVs.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/company/login#signup"
            className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-sm font-semibold transition hover:opacity-90 sm:w-auto"
          >
            Company Sign up
          </Link>
          <Link
            href="/company/login"
            className="w-full rounded-full border bg-white/5 px-8 py-3.5 text-sm font-semibold transition sm:w-auto"
          >
            Company Login
          </Link>
        </div>

        <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-slate-400">
          Looking for a job? Please use the application link shared by the company you are
          applying to.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-mono text-sm text-indigo-300">{s.n}</p>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Why companies use it</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-10 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Start hiring smarter today</h2>
          <p className="mt-3 text-sm text-slate-400">Free to start. No card needed.</p>
          <Link
            href="/company/login#signup"
            className="mt-7 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-sm font-semibold transition hover:opacity-90"
          >
            Create company account
          </Link>
        </div>
      </section>
    </>
  );
}