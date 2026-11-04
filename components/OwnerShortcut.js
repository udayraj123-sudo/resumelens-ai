"use client";

import { useEffect } from "react";

// Hidden owner shortcut:
//  - click the navbar logo 5 times within 3 seconds, or
//  - press Alt + Shift + O
// It only opens /owner. The owner password is still required there.
export default function OwnerShortcut() {
  useEffect(() => {
    let clicks = [];

    function onClick(e) {
      const el =
        e.target instanceof Element
          ? e.target.closest('header a[href="/"], nav a[href="/"]')
          : null;
      if (!el) return;
      const now = Date.now();
      clicks = clicks.filter((t) => now - t < 3000);
      clicks.push(now);
      if (clicks.length >= 5) {
        clicks = [];
        e.preventDefault();
        window.location.assign("/owner");
      }
    }

    function onKey(e) {
      if (e.altKey && e.shiftKey && e.code === "KeyO") {
        e.preventDefault();
        window.location.assign("/owner");
      }
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}