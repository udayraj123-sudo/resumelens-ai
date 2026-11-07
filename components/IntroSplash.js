"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const SIZE = 168; // logo size in the middle of the screen
const BG = "#06060a"; // overlay colour: change this to match the page background

const CSS = `
#rl-intro{display:none}
html[data-intro="play"] #rl-intro{display:block}
html[data-intro="play"] [data-owner-logo] > span:first-child{visibility:hidden}
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function IntroSplash() {
  const [done, setDone] = useState(false);
  const veil = useRef(null);
  const ring = useRef(null);
  const word = useRef(null);
  const fly = useRef(null);
  const spin = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    const anims = [];
    const run = (el, keyframes, opts) => {
      const a = el.animate(keyframes, opts);
      anims.push(a);
      return a.finished;
    };

    function finish() {
      root.dataset.intro = "skip";
      try {
        sessionStorage.setItem("rl-intro", "1");
      } catch {}
      setDone(true);
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem("rl-intro") === "1" && !location.search.includes("intro");
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      finish();
      return;
    }

    const failsafe = setTimeout(() => {
      if (!cancelled) finish();
    }, 8000);

    (async () => {
      try {
        // 1) logo appears in the centre
        await run(
          spin.current,
          [
            { opacity: 0, transform: "scale(0.5) rotateY(-90deg)", filter: "blur(12px)" },
            { opacity: 1, transform: "scale(1) rotateY(0deg)", filter: "blur(0px)" },
          ],
          { duration: 900, easing: "cubic-bezier(.2,1.2,.3,1)", fill: "forwards" }
        );

        // 2) ring pulse, name fades in, logo turns around
        run(word.current, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], {
          duration: 500,
          fill: "forwards",
        });
        run(ring.current, [{ opacity: 0.7, transform: "scale(1)" }, { opacity: 0, transform: "scale(2.6)" }], {
          duration: 1000,
          easing: "ease-out",
        });
        await run(
          spin.current,
          [
            { transform: "scale(1) rotateY(0deg)" },
            { transform: "scale(1.12) rotateY(180deg)", offset: 0.5 },
            { transform: "scale(1) rotateY(360deg)" },
          ],
          { duration: 1100, easing: "ease-in-out", fill: "forwards" }
        );
        await sleep(150);

        // 3) fly into the navbar logo
        const img = document.querySelector("[data-owner-logo] img");
        const cx = root.clientWidth / 2;
        const cy = root.clientHeight / 2;
        let dx = 0;
        let dy = 0;
        let s = 0.25;
        if (img) {
          const r = img.getBoundingClientRect();
          dx = r.left + r.width / 2 - cx;
          dy = r.top + r.height / 2 - cy;
          s = r.width / SIZE;
        }
        run(word.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
        run(veil.current, [{ opacity: 1 }, { opacity: 0 }], {
          duration: 750,
          delay: 100,
          easing: "ease-in",
          fill: "forwards",
        });
        await run(
          fly.current,
          [
            { transform: "translate(0px,0px) scale(1)" },
            { transform: `translate(${dx}px,${dy}px) scale(${s})` },
          ],
          { duration: 850, easing: "cubic-bezier(.7,0,.25,1)", fill: "forwards" }
        );
      } catch {
        // animation was cancelled: nothing to do
      }
      if (!cancelled) {
        clearTimeout(failsafe);
        finish();
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!done && (
        <div id="rl-intro" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
          <div ref={veil} style={{ position: "absolute", inset: 0, background: BG }} />
          <div
            ref={ring}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              width: SIZE,
              height: SIZE,
              margin: `${-SIZE / 2}px 0 0 ${-SIZE / 2}px`,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.55)",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
          <div
            ref={word}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: `calc(50% + ${SIZE / 2 + 28}px)`,
              textAlign: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.04em",
              opacity: 0,
            }}
          >
            ResumeLens AI
          </div>
          <div
            ref={fly}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              width: SIZE,
              height: SIZE,
              margin: `${-SIZE / 2}px 0 0 ${-SIZE / 2}px`,
              perspective: 900,
            }}
          >
            <div ref={spin} style={{ opacity: 0 }}>
              <Logo size={SIZE} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}