/**
 * A VEX IQ style robot on a field tile, drawn rather than photographed. The
 * container is 4:3 so a real team photo can replace this file without any
 * layout change.
 */
export function RobotHero() {
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label="An illustration of a VEX robot on a competition field tile" className="h-auto w-full">
      <rect x="0" y="0" width="400" height="300" fill="var(--surface)" />
      <g stroke="var(--line)" strokeWidth="1">
        {[0, 50, 100, 150, 200, 250, 300, 350].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" />
        ))}
        {[0, 50, 100, 150, 200, 250].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} />
        ))}
      </g>
      <ellipse cx="200" cy="245" rx="95" ry="12" fill="var(--foreground)" opacity="0.08" />
      <rect x="120" y="120" width="160" height="105" rx="10" fill="var(--purple)" />
      <rect x="136" y="138" width="128" height="52" rx="6" fill="var(--surface)" opacity="0.92" />
      <circle cx="170" cy="164" r="11" fill="var(--teal)" />
      <circle cx="230" cy="164" r="11" fill="var(--teal)" />
      <rect x="150" y="86" width="100" height="36" rx="8" fill="var(--foreground)" />
      <rect x="166" y="98" width="68" height="12" rx="4" fill="var(--amber)" />
      <circle cx="128" cy="228" r="26" fill="var(--foreground)" />
      <circle cx="128" cy="228" r="11" fill="var(--line)" />
      <circle cx="272" cy="228" r="26" fill="var(--foreground)" />
      <circle cx="272" cy="228" r="11" fill="var(--line)" />
      <rect x="286" y="150" width="58" height="14" rx="7" fill="var(--amber)" />
      <rect x="56" y="150" width="58" height="14" rx="7" fill="var(--amber)" />
    </svg>
  );
}
