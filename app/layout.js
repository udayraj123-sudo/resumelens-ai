import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OwnerShortcut from "@/components/OwnerShortcut";
import IntroSplash from "@/components/IntroSplash";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "ResumeLens AI — AI-Powered Resume Screening",
  description: "AI-powered resume screening and matching system",
};

// runs before the page is painted: decides if the logo intro should play
const INTRO_SCRIPT = `try{var q=location.search.indexOf("intro")>-1;var s=sessionStorage.getItem("rl-intro")==="1";document.documentElement.dataset.intro=(s&&!q)?"skip":"play"}catch(e){document.documentElement.dataset.intro="play"}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <IntroSplash />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <OwnerShortcut />
      </body>
    </html>
  );
}