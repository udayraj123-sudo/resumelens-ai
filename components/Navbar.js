import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  const message =
    "Hi! I just viewed your ResumeLens AI website and really liked the work. I'd love to connect and discuss it further.";
  const whatsappLink = "https://wa.me/918828783516?text=" + encodeURIComponent(message);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070c]/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" data-owner-logo className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-bold tracking-tight">
            ResumeLens <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/company/login"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Company Login
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Contact Me
          </a>
        </div>
      </nav>
    </header>
  );
}