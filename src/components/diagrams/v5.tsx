import { Defs, Card, T, Arrow, Pill, SCHEMES, MUTED, INK } from "./parts";

/* ---------- Chapter 15 ---------- */

export function WheelSizes() {
  const wheels = [
    { d: 2.75, r: 34, s: "purple" as const, note: "Spins faster for the same motor RPM." },
    { d: 3.25, r: 40, s: "teal" as const, note: "The middle ground most builds start at." },
    { d: 4, r: 49, s: "amber" as const, note: "More ground per turn, needs more torque." },
  ];
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      {wheels.map((w, i) => {
        const x = 116 + i * 204;
        return (
          <g key={i}>
            <circle cx={x} cy={92} r={w.r} fill={SCHEMES[w.s].bg} stroke={SCHEMES[w.s].solid} strokeWidth={2} />
            <circle cx={x} cy={92} r={w.r * 0.32} fill="#ffffff" stroke={SCHEMES[w.s].solid} strokeWidth={1.5} />
            <T x={x} y={166} size={15} weight={700} fill={SCHEMES[w.s].text}>
              {w.d}&quot;
            </T>
            <foreignObject x={x - 92} y={178} width={184} height={44}>
              <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 11.5, lineHeight: 1.35, color: MUTED, textAlign: "center" }}>
                {w.note}
              </div>
            </foreignObject>
          </g>
        );
      })}
      <T x={320} y={26} size={12.5} weight={600} fill={INK}>
        Wheel size sets your speed ceiling. Pick your target speed first, then let size follow.
      </T>
    </svg>
  );
}

export function SpeedReference() {
  const x0 = 50;
  const x1 = 590;
  const max = 100;
  const at = (v: number) => x0 + ((x1 - x0) * v) / max;
  return (
    <svg viewBox="0 0 640 220" className="h-auto w-full">
      <Defs />
      <rect x={x0} y={78} width={at(62) - x0} height={26} rx={6} fill={SCHEMES.teal.bg} />
      <rect x={at(62)} y={78} width={at(70) - at(62)} height={26} fill={SCHEMES.amber.bg} />
      <rect x={at(70)} y={78} width={x1 - at(70)} height={26} rx={6} fill="#fee2e2" />

      <line x1={at(62)} y1={68} x2={at(62)} y2={114} stroke={SCHEMES.amber.solid} strokeWidth={2} />
      <line x1={at(70)} y1={68} x2={at(70)} y2={114} stroke="#dc2626" strokeWidth={2} />

      <T x={(x0 + at(62)) / 2} y={91} size={12} weight={600} fill={SCHEMES.teal.text}>
        Controllable on almost any build
      </T>
      <T x={(at(70) + x1) / 2} y={91} size={12} weight={600} fill="#991b1b">
        Needs excellent driving
      </T>

      <T x={at(62)} y={132} size={12} weight={700} fill={SCHEMES.amber.text}>
        62 in/sec
      </T>
      <T x={at(70)} y={152} size={12} weight={700} fill="#991b1b">
        70 in/sec
      </T>

      <line x1={x0} y1={54} x2={x1} y2={54} stroke="#e5e5e5" strokeWidth={1} />
      <T x={x0} y={40} size={11} fill={MUTED} anchor="start">
        slower
      </T>
      <T x={x1} y={40} size={11} fill={MUTED} anchor="end">
        faster
      </T>
      <T x={320} y={190} size={11.5} fill={MUTED}>
        Past 70, you also need a very stiff robot, or the speed is wasted fighting your own flex.
      </T>
    </svg>
  );
}

export function WheelLayout() {
  const rows = [64, 116, 168];
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      <rect x={222} y={34} width={196} height={168} rx={14} fill="#ffffff" stroke={MUTED} strokeWidth={1.5} />
      {rows.map((y, ri) =>
        [232, 386].map((x, ci) => {
          const traction = ri === 1;
          const s = traction ? SCHEMES.amber : SCHEMES.purple;
          return (
            <g key={`${ri}-${ci}`}>
              <rect x={x - 14} y={y - 22} width={28} height={44} rx={7} fill={s.bg} stroke={s.solid} strokeWidth={1.75} />
              {traction ? (
                <>
                  <line x1={x - 8} y1={y - 10} x2={x + 8} y2={y - 10} stroke={s.solid} strokeWidth={2} />
                  <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke={s.solid} strokeWidth={2} />
                  <line x1={x - 8} y1={y + 10} x2={x + 8} y2={y + 10} stroke={s.solid} strokeWidth={2} />
                </>
              ) : (
                <circle cx={x} cy={y} r={7} fill="none" stroke={s.solid} strokeWidth={1.75} />
              )}
            </g>
          );
        })
      )}
      <line x1={200} y1={116} x2={440} y2={116} stroke={SCHEMES.amber.solid} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={140} y={116} size={12} weight={700} fill={SCHEMES.amber.text} anchor="end">
        Turning line
      </T>
      <Arrow x1={148} y1={116} x2={196} y2={116} scheme="amber" />

      <Pill x={528} y={64} label="Omni" scheme="purple" />
      <T x={528} y={86} size={11} fill={MUTED}>
        rolls sideways
      </T>
      <Pill x={528} y={124} label="Traction" scheme="amber" />
      <T x={528} y={146} size={11} fill={MUTED}>
        grips, pushes hard
      </T>

      <T x={320} y={226} size={11.5} fill={MUTED}>
        High Stakes: 6 omni, 2 traction centred. Pushing power at the goal without killing the turn.
      </T>
    </svg>
  );
}

/* ---------- Chapter 16 ---------- */

export function LiftTypes() {
  return (
    <svg viewBox="0 0 640 270" className="h-auto w-full">
      <Defs />
      {/* Four-bar */}
      <g>
        <T x={90} y={26} size={13} weight={700} fill={SCHEMES.purple.text}>
          Four-bar
        </T>
        <rect x={40} y={168} width={16} height={56} rx={4} fill="var(--neutral-bg)" stroke={MUTED} strokeWidth={1.5} />
        <line x1={48} y1={182} x2={124} y2={124} stroke={SCHEMES.purple.solid} strokeWidth={3} strokeLinecap="round" />
        <line x1={48} y1={212} x2={124} y2={154} stroke={SCHEMES.purple.solid} strokeWidth={3} strokeLinecap="round" />
        <rect x={120} y={116} width={14} height={46} rx={4} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={2} />
        <T x={90} y={246} size={11} fill={MUTED}>
          End stays level
        </T>
      </g>
      {/* Six-bar */}
      <g>
        <T x={244} y={26} size={13} weight={700} fill={SCHEMES.teal.text}>
          Six-bar
        </T>
        <rect x={186} y={168} width={16} height={56} rx={4} fill="var(--neutral-bg)" stroke={MUTED} strokeWidth={1.5} />
        <line x1={194} y1={182} x2={250} y2={140} stroke={SCHEMES.teal.solid} strokeWidth={3} strokeLinecap="round" />
        <line x1={194} y1={212} x2={250} y2={170} stroke={SCHEMES.teal.solid} strokeWidth={3} strokeLinecap="round" />
        <line x1={250} y1={140} x2={300} y2={104} stroke={SCHEMES.teal.solid} strokeWidth={3} strokeLinecap="round" />
        <line x1={250} y1={170} x2={300} y2={134} stroke={SCHEMES.teal.solid} strokeWidth={3} strokeLinecap="round" />
        <rect x={296} y={96} width={14} height={46} rx={4} fill={SCHEMES.teal.bg} stroke={SCHEMES.teal.solid} strokeWidth={2} />
        <T x={248} y={246} size={11} fill={MUTED}>
          Longer reach, more torque
        </T>
      </g>
      {/* DR4B */}
      <g>
        <T x={424} y={26} size={13} weight={700} fill={SCHEMES.amber.text}>
          DR4B
        </T>
        <rect x={378} y={168} width={16} height={56} rx={4} fill="var(--neutral-bg)" stroke={MUTED} strokeWidth={1.5} />
        <line x1={386} y1={182} x2={432} y2={136} stroke={SCHEMES.amber.solid} strokeWidth={3} strokeLinecap="round" />
        <line x1={386} y1={210} x2={432} y2={164} stroke={SCHEMES.amber.solid} strokeWidth={3} strokeLinecap="round" />
        <line x1={432} y1={136} x2={430} y2={82} stroke={SCHEMES.amber.solid} strokeWidth={3} strokeLinecap="round" />
        <line x1={456} y1={140} x2={454} y2={86} stroke={SCHEMES.amber.solid} strokeWidth={3} strokeLinecap="round" />
        <rect x={424} y={70} width={38} height={14} rx={4} fill={SCHEMES.amber.bg} stroke={SCHEMES.amber.solid} strokeWidth={2} />
        <Arrow x1={484} y1={150} x2={484} y2={82} scheme="amber" />
        <T x={424} y={246} size={11} fill={MUTED}>
          Rises almost straight up
        </T>
      </g>
      {/* Cascade */}
      <g>
        <T x={572} y={26} size={13} weight={700} fill="var(--neutral-text)">
          Cascade
        </T>
        <rect x={546} y={150} width={52} height={74} rx={6} fill="var(--neutral-bg)" stroke={MUTED} strokeWidth={1.5} />
        <rect x={554} y={110} width={36} height={54} rx={5} fill="#fafaf9" stroke={MUTED} strokeWidth={1.5} />
        <rect x={561} y={74} width={22} height={48} rx={4} fill={SCHEMES.neutral.bg} stroke="#a3a3a3" strokeWidth={1.5} />
        <Arrow x1={614} y1={150} x2={614} y2={74} scheme="neutral" />
        <T x={572} y={246} size={11} fill={MUTED}>
          Height in a tight footprint
        </T>
      </g>
    </svg>
  );
}

/* ---------- Chapter 17 ---------- */

export function LauncherTypes() {
  return (
    <svg viewBox="0 0 640 260" className="h-auto w-full">
      <Defs />
      {/* Catapult */}
      <g>
        <Card x={16} y={20} w={192} h={192} scheme="purple" filled={false} />
        <Pill x={112} y={44} label="Catapult" scheme="purple" />
        <path d="M 56 168 A 62 62 0 0 1 138 108" fill="none" stroke={SCHEMES.purple.solid} strokeWidth={2} strokeDasharray="5 4" />
        <line x1={56} y1={168} x2={112} y2={120} stroke={SCHEMES.purple.solid} strokeWidth={4} strokeLinecap="round" />
        <circle cx={116} cy={116} r={9} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={2} />
        <circle cx={56} cy={168} r={5} fill={SCHEMES.purple.solid} />
        <line x1={132} y1={100} x2={148} y2={84} stroke={SCHEMES.purple.solid} strokeWidth={2.5} />
        <T x={112} y={192} size={11} fill={MUTED}>
          Hard hit, then reload
        </T>
      </g>
      {/* Flywheel */}
      <g>
        <Card x={224} y={20} w={192} h={192} scheme="teal" filled={false} />
        <Pill x={320} y={44} label="Flywheel" scheme="teal" />
        <circle cx={300} cy={140} r={38} fill={SCHEMES.teal.bg} stroke={SCHEMES.teal.solid} strokeWidth={2.5} />
        <circle cx={300} cy={140} r={6} fill={SCHEMES.teal.solid} />
        <path d="M 274 112 A 38 38 0 0 1 330 116" fill="none" stroke={SCHEMES.teal.solid} strokeWidth={2} markerEnd="url(#arrow-teal)" />
        <circle cx={356} cy={106} r={9} fill="#ffffff" stroke={SCHEMES.teal.solid} strokeWidth={2} />
        <Arrow x1={334} y1={122} x2={372} y2={92} scheme="teal" />
        <T x={320} y={192} size={11} fill={MUTED}>
          Never stops, no reload
        </T>
      </g>
      {/* Puncher */}
      <g>
        <Card x={432} y={20} w={192} h={192} scheme="amber" filled={false} />
        <Pill x={528} y={44} label="Puncher" scheme="amber" />
        <rect x={456} y={126} width={68} height={26} rx={5} fill={SCHEMES.amber.bg} stroke={SCHEMES.amber.solid} strokeWidth={2} />
        <path d="M 462 118 q 10 -12 20 0 q 10 -12 20 0 q 10 -12 20 0" fill="none" stroke={SCHEMES.amber.solid} strokeWidth={2} />
        <rect x={524} y={132} width={44} height={14} rx={4} fill={SCHEMES.amber.solid} />
        <circle cx={584} cy={139} r={9} fill="#ffffff" stroke={SCHEMES.amber.solid} strokeWidth={2} />
        <Arrow x1={568} y1={139} x2={600} y2={139} scheme="amber" />
        <T x={528} y={192} size={11} fill={MUTED}>
          One stored-energy hit
        </T>
      </g>
      <T x={320} y={238} size={11.5} fill={MUTED}>
        Match the mechanism to reload demand, not raw power.
      </T>
    </svg>
  );
}

/* ---------- Chapter 18 ---------- */

export function SolenoidCylinder() {
  return (
    <svg viewBox="0 0 640 220" className="h-auto w-full">
      <Defs />
      <rect x={54} y={78} width={104} height={64} rx={10} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={2} />
      <T x={106} y={110} size={13} weight={700} fill={SCHEMES.purple.text}>
        Solenoid
      </T>
      <circle cx={168} cy={94} r={7} fill="#ffffff" stroke={SCHEMES.purple.solid} strokeWidth={2} />
      <T x={182} y={94} size={11} weight={700} fill={SCHEMES.purple.text} anchor="start">
        A
      </T>
      <circle cx={168} cy={128} r={7} fill="#ffffff" stroke={SCHEMES.purple.solid} strokeWidth={2} />
      <T x={182} y={128} size={11} weight={700} fill={SCHEMES.purple.text} anchor="start">
        B
      </T>

      <path d="M 176 94 C 240 94 250 84 320 84" fill="none" stroke={SCHEMES.purple.solid} strokeWidth={2} />
      <path d="M 176 128 C 240 128 250 138 320 138" fill="none" stroke={SCHEMES.purple.solid} strokeWidth={2} />

      <rect x={320} y={84} width={150} height={54} rx={8} fill="#ffffff" stroke={SCHEMES.teal.solid} strokeWidth={2} />
      <rect x={328} y={94} width={44} height={34} rx={5} fill={SCHEMES.teal.bg} />
      <rect x={470} y={102} width={78} height={18} rx={9} fill={SCHEMES.teal.solid} />
      <circle cx={566} cy={111} r={11} fill="#ffffff" stroke={SCHEMES.teal.solid} strokeWidth={2} />
      <T x={420} y={111} size={12} weight={700} fill={SCHEMES.teal.text}>
        Cylinder
      </T>

      <T x={106} y={168} size={11.5} fill={MUTED}>
        Two ports, one job
      </T>
      <T x={445} y={168} size={11.5} fill={MUTED}>
        A extends, B retracts
      </T>
      <T x={320} y={198} size={12} weight={600} fill={INK}>
        One solenoid controls one double-acting cylinder. Full stop.
      </T>
    </svg>
  );
}

export function TeeFitting() {
  return (
    <svg viewBox="0 0 640 220" className="h-auto w-full">
      <Defs />
      <rect x={30} y={82} width={104} height={56} rx={10} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={2} />
      <T x={82} y={104} size={12.5} weight={700} fill={SCHEMES.purple.text}>
        One solenoid
      </T>
      <T x={82} y={122} size={10.5} fill={SCHEMES.purple.text}>
        one timing
      </T>

      <path d="M 134 110 L 236 110" stroke={SCHEMES.amber.solid} strokeWidth={2.5} fill="none" />
      <circle cx={236} cy={110} r={7} fill={SCHEMES.amber.solid} />
      <T x={224} y={90} size={11} weight={700} fill={SCHEMES.amber.text} anchor="end">
        Tee
      </T>
      <path d="M 236 110 L 236 60 L 306 60" stroke={SCHEMES.amber.solid} strokeWidth={2.5} fill="none" />
      <path d="M 236 110 L 236 160 L 306 160" stroke={SCHEMES.amber.solid} strokeWidth={2.5} fill="none" />

      {[60, 160].map((y, i) => (
        <g key={i}>
          <rect x={306} y={y - 20} width={106} height={40} rx={8} fill="#ffffff" stroke={SCHEMES.teal.solid} strokeWidth={2} />
          <rect x={316} y={y - 12} width={54} height={24} rx={5} fill={SCHEMES.teal.bg} />
          <rect x={412} y={y - 8} width={62} height={16} rx={8} fill={SCHEMES.teal.solid} />
          <circle cx={492} cy={y} r={10} fill="#ffffff" stroke={SCHEMES.teal.solid} strokeWidth={2} />
          <T x={359} y={y} size={11} weight={600} fill={SCHEMES.teal.text}>
            Cylinder {i + 1}
          </T>
          <Arrow x1={506} y1={y} x2={548} y2={y} scheme="teal" />
        </g>
      ))}
      <T x={578} y={110} size={12} weight={700} fill={SCHEMES.teal.text}>
        In sync
      </T>
      <T x={320} y={200} size={11.5} fill={MUTED}>
        Good for two claws that always open and close together. Never for two things that need separate timing.
      </T>
    </svg>
  );
}

export function PneumaticSystem() {
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      <rect x={22} y={92} width={74} height={66} rx={10} fill={SCHEMES.amber.bg} stroke={SCHEMES.amber.solid} strokeWidth={2} />
      <T x={59} y={118} size={12.5} weight={700} fill={SCHEMES.amber.text}>
        Tank
      </T>
      <T x={59} y={136} size={10.5} fill={SCHEMES.amber.text}>
        limited air
      </T>
      <Arrow x1={100} y1={125} x2={136} y2={125} scheme="amber" />

      <rect x={140} y={104} width={70} height={42} rx={9} fill="#ffffff" stroke={SCHEMES.amber.solid} strokeWidth={2} />
      <T x={175} y={125} size={11.5} weight={700} fill={SCHEMES.amber.text}>
        Regulator
      </T>

      <path d="M 212 125 L 268 125" stroke={SCHEMES.amber.solid} strokeWidth={2.5} fill="none" />
      <circle cx={268} cy={125} r={5} fill={SCHEMES.amber.solid} />
      <path d="M 268 125 L 268 56 L 320 56" stroke={SCHEMES.amber.solid} strokeWidth={2} fill="none" />
      <path d="M 268 125 L 320 125" stroke={SCHEMES.amber.solid} strokeWidth={2} fill="none" />
      <path d="M 268 125 L 268 194 L 320 194" stroke={SCHEMES.amber.solid} strokeWidth={2} fill="none" />
      <T x={258} y={100} size={10.5} fill={MUTED} anchor="end">
        shared supply
      </T>

      {[56, 125, 194].map((y, i) => (
        <g key={i}>
          <rect x={320} y={y - 20} width={94} height={40} rx={8} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={1.75} />
          <T x={367} y={y} size={11.5} weight={700} fill={SCHEMES.purple.text}>
            Solenoid {i + 1}
          </T>
          <Arrow x1={418} y1={y} x2={452} y2={y} scheme="purple" />
          <rect x={456} y={y - 14} width={84} height={28} rx={6} fill="#ffffff" stroke={SCHEMES.teal.solid} strokeWidth={1.75} />
          <rect x={540} y={y - 6} width={40} height={12} rx={6} fill={SCHEMES.teal.solid} />
          <T x={498} y={y} size={11} weight={600} fill={SCHEMES.teal.text}>
            Cylinder
          </T>
        </g>
      ))}
      <T x={320} y={232} size={11.5} fill={MUTED}>
        Every solenoid draws from the same tank. More functions means fewer full-power fires of each.
      </T>
    </svg>
  );
}

/* ---------- Chapter 20 ---------- */

export function ScoutingTimeline() {
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      <line x1={56} y1={104} x2={592} y2={104} stroke="#e5e5e5" strokeWidth={4} strokeLinecap="round" />

      {[
        { x: 128, s: "purple" as const, t: "Before the event", b: "Skills rankings and past results are public. Look teams up now." },
        { x: 320, s: "teal" as const, t: "2 to 3 matches ahead", b: "Find your alliance partner. This is the sync window." },
        { x: 516, s: "amber" as const, t: "On the field", b: "No surprises left to figure out mid-match." },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={104} r={11} fill={SCHEMES[p.s].solid} stroke="#ffffff" strokeWidth={3} />
          <T x={p.x} y={70} size={12.5} weight={700} fill={SCHEMES[p.s].text}>
            {p.t}
          </T>
          <foreignObject x={p.x - 96} y={124} width={192} height={56}>
            <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 11.5, lineHeight: 1.4, color: MUTED, textAlign: "center" }}>
              {p.b}
            </div>
          </foreignObject>
        </g>
      ))}

      <rect x={196} y={186} width={248} height={44} rx={10} fill={SCHEMES.teal.bg} stroke={SCHEMES.teal.solid} strokeWidth={1.5} />
      <T x={320} y={200} size={11} weight={700} fill={SCHEMES.teal.text}>
        DECIDE IN THAT CONVERSATION
      </T>
      <T x={320} y={217} size={11} fill={INK}>
        autonomous · strategy · field side and target
      </T>
      <T x={320} y={32} size={12.5} weight={600} fill={INK}>
        Scouting happens in two layers, before the event and during it.
      </T>
    </svg>
  );
}
