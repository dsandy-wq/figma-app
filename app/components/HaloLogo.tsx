/**
 * Halo brand mark — three interlocking rings (green, yellow, coral).
 * Uses clip paths to achieve the chain-link interleaving effect.
 */
export default function HaloLogo({ size = 40 }: { size?: number }) {
  const h = Math.round(size * 68 / 80);
  return (
    <svg width={size} height={h} viewBox="0 0 80 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Yellow: upper arc goes BEHIND green */}
        <clipPath id="halo-gy-back">
          <rect x="-60" y="-60" width="260" height="87" />
        </clipPath>
        {/* Yellow: lower arc goes IN FRONT of green */}
        <clipPath id="halo-gy-front">
          <rect x="-60" y="27" width="260" height="200" />
        </clipPath>
        {/* Coral: upper arc goes BEHIND yellow */}
        <clipPath id="halo-yr-back">
          <rect x="-60" y="-60" width="260" height="105" />
        </clipPath>
        {/* Coral: lower arc goes IN FRONT of yellow */}
        <clipPath id="halo-yr-front">
          <rect x="-60" y="45" width="260" height="200" />
        </clipPath>
      </defs>

      {/* 1 — Yellow upper arc (behind green) */}
      <ellipse cx="38" cy="36" rx="23" ry="11"
        transform="rotate(-25 38 36)"
        stroke="#e9c96c" strokeWidth="8" fill="none"
        clipPath="url(#halo-gy-back)" />

      {/* 2 — Green ring (full) */}
      <ellipse cx="24" cy="18" rx="23" ry="11"
        transform="rotate(-25 24 18)"
        stroke="#8ec86a" strokeWidth="8" fill="none" />

      {/* 3 — Coral upper arc (behind yellow) */}
      <ellipse cx="52" cy="54" rx="23" ry="11"
        transform="rotate(-25 52 54)"
        stroke="#eb7055" strokeWidth="8" fill="none"
        clipPath="url(#halo-yr-back)" />

      {/* 4 — Yellow lower arc (in front of green) */}
      <ellipse cx="38" cy="36" rx="23" ry="11"
        transform="rotate(-25 38 36)"
        stroke="#e9c96c" strokeWidth="8" fill="none"
        clipPath="url(#halo-gy-front)" />

      {/* 5 — Coral lower arc (in front of yellow) */}
      <ellipse cx="52" cy="54" rx="23" ry="11"
        transform="rotate(-25 52 54)"
        stroke="#eb7055" strokeWidth="8" fill="none"
        clipPath="url(#halo-yr-front)" />
    </svg>
  );
}
