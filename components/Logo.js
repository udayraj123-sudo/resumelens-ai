const CSS = `
@keyframes rl-sweep {
  0%, 55% { transform: translateX(-160%) skewX(-12deg); }
  100% { transform: translateX(320%) skewX(-12deg); }
}
@media (prefers-reduced-motion: reduce) {
  .rl-sweep-anim { animation: none !important; }
}
`;

/**
 * ResumeLens logo: white tile with a black R, and a soft shine that sweeps across.
 * <Logo size={40} />  -> size is the width of the tile.
 * Styles are inline on purpose, so nothing else in the project can break the logo.
 */
export default function Logo({ size = 40 }) {
  const big = size >= 160;

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
              "linear-gradient(105deg, transparent, rgba(0,0,0,0.10), transparent)",
            transform: "translateX(-160%) skewX(-12deg)",
            animation: "rl-sweep 6s ease-in-out infinite",
          }}
        />
      </span>
    </span>
  );
}