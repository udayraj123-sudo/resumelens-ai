export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rl-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#rl-grad)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" stroke="white" strokeOpacity="0.2" />
      <path
        d="M12 23V9h6a4.5 4.5 0 0 1 0 9h-6M18 18l4.5 5"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}