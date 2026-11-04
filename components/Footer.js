import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const supportMessage = "Hi! I need help with ResumeLens AI.";
  const supportLink = "https://wa.me/918828783516?text=" + encodeURIComponent(supportMessage);

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-400 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-semibold text-slate-200">ResumeLens AI</span>
        </div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <a href={supportLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            Contact Support
          </a>
        </div>
        <p>© 2026 ResumeLens AI. All rights reserved.</p>
      </div>
    </footer>
  );
}