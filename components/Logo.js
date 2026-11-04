const CSS = `
@keyframes rl-breathe {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
  50% { transform: scale(1.02) rotate(0.8deg); opacity: 1; }
}
@keyframes rl-sweep {
  0%, 55% { transform: translateX(-160%) skewX(-12deg); }
  100% { transform: translateX(320%) skewX(-12deg); }
}
@media (prefers-reduced-motion: reduce) {
  .rl-smoke-anim, .rl-sweep-anim { animation: none !important; }
}
`;

/**
 * ResumeLens logo: the tile stays still, the smoke breathes, a shine sweeps across.
 * <Logo size={40} />  -> size is the width of the tile.
 * Styles are inline on purpose, so nothing else in the project can break the logo.
 */
export default function Logo({ size = 40 }) {
  const big = size >= 160;
  const box = size / 0.5735; // the smoke image is larger than the tile
  const offset = (size - box) / 2;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        flex: "none",
        width: size,
        height: size,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="rl-smoke-anim"
        src={big ? "/logo-smoke-1000.webp" : "/logo-smoke-512.webp"}
        alt=""
        style={{
          position: "absolute",
          display: "block",
          maxWidth: "none",
          width: box,
          height: box,
          left: offset,
          top: offset,
          pointerEvents: "none",
          animation: "rl-breathe 7s ease-in-out infinite",
        }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={big ? "/logo-tile-512.webp" : "/logo-tile-256.webp"}
        alt="ResumeLens AI"
        style={{
          position: "absolute",
          display: "block",
          maxWidth: "none",
          left: 0,
          top: 0,
          width: size,
          height: size,
        }}
      />

      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "21%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <span
          className="rl-sweep-anim"
          style={{
            position: "absolute",
            top: "-20%",
            bottom: "-20%",
            left: 0,
            width: "45%",
            background:
              "linear-gradient(105deg, transparent, rgba(255,255,255,0.34), transparent)",
            transform: "translateX(-160%) skewX(-12deg)",
            animation: "rl-sweep 6s ease-in-out infinite",
          }}
        />
      </span>
    </span>
  );
}