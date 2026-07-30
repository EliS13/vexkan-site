import { Defs, Card, T, Arrow, Pill, Gear, SCHEMES, MUTED, INK } from "./parts";

/* ---------- Chapter 1 ---------- */

export function BrainSystemDiagram() {
  const nodes = [
    { x: 110, y: 42, label: "Motor", scheme: "teal" as const },
    { x: 320, y: 42, label: "Motor", scheme: "teal" as const },
    { x: 530, y: 42, label: "Motor", scheme: "teal" as const },
    { x: 110, y: 226, label: "Motor", scheme: "teal" as const },
    { x: 320, y: 226, label: "Sensor", scheme: "amber" as const },
    { x: 530, y: 226, label: "Sensor", scheme: "amber" as const },
  ];
  return (
    <svg viewBox="0 0 640 280" className="h-auto w-full">
      <Defs />
      {nodes.map((n, i) => (
        <line
          key={`l${i}`}
          x1={320}
          y1={134}
          x2={n.x}
          y2={n.y}
          stroke={SCHEMES[n.scheme].solid}
          strokeWidth={1.75}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x - 55}
            y={n.y - 20}
            width={110}
            height={40}
            rx={9}
            fill={SCHEMES[n.scheme].bg}
            stroke={SCHEMES[n.scheme].solid}
            strokeWidth={1.5}
          />
          <T x={n.x} y={n.y} size={13} weight={600} fill={SCHEMES[n.scheme].text}>
            {n.label}
          </T>
        </g>
      ))}
      <rect x={242} y={106} width={156} height={56} rx={12} fill="var(--purple)" />
      <T x={320} y={126} size={14} weight={700} fill="#ffffff">
        The Brain
      </T>
      <T x={320} y={145} size={11} fill="#e8e6fb">
        one controller, everything
      </T>
    </svg>
  );
}

export function CompetitionFormats() {
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      <Card x={16} y={16} w={296} h={218} scheme="purple" filled={false} />
      <Pill x={164} y={46} label="Teamwork Challenge" scheme="purple" w={210} />
      <T x={164} y={92} size={26} weight={700} fill="var(--purple-text)">
        2 robots
      </T>
      <T x={164} y={122} size={13} fill={INK}>
        One alliance, working together.
      </T>
      <T x={164} y={152} size={26} weight={700} fill="var(--purple-text)">
        60 seconds
      </T>
      <T x={164} y={182} size={13} fill={INK}>
        You score as a team.
      </T>
      <T x={164} y={208} size={12} fill={MUTED}>
        Your score is a shared score.
      </T>

      <Card x={328} y={16} w={296} h={218} scheme="teal" filled={false} />
      <Pill x={476} y={46} label="Robot Skills" scheme="teal" w={150} />
      <T x={476} y={92} size={26} weight={700} fill="var(--teal-text)">
        1 robot
      </T>
      <T x={476} y={122} size={13} fill={INK}>
        Your robot alone, against the clock.
      </T>
      <T x={476} y={152} size={15} weight={600} fill="var(--teal-text)">
        Driving Skills, you drive
      </T>
      <T x={476} y={178} size={15} weight={600} fill="var(--teal-text)">
        Coding Skills, your code drives
      </T>
      <T x={476} y={208} size={12} fill={MUTED}>
        No partner to depend on.
      </T>
    </svg>
  );
}

/* ---------- Chapter 2 ---------- */

export function ManualReadingFlow() {
  const steps = [
    { x: 20, title: "Scoring first", body: "What are the objects? How do points happen?", scheme: "purple" as const },
    { x: 232, title: "Then general rules", body: "Hunt for what changed since last season.", scheme: "teal" as const },
    { x: 444, title: "Q&A if unclear", body: "Get a ruling on the record, do not guess.", scheme: "amber" as const },
  ];
  return (
    <svg viewBox="0 0 640 210" className="h-auto w-full">
      <Defs />
      {steps.map((s, i) => (
        <g key={i}>
          <Card x={s.x} y={34} w={176} h={116} scheme={s.scheme} />
          <circle cx={s.x + 26} cy={60} r={13} fill={SCHEMES[s.scheme].solid} />
          <T x={s.x + 26} y={60} size={12} weight={700} fill="#ffffff">
            {i + 1}
          </T>
          <T x={s.x + 88} y={92} size={14} weight={700} fill={SCHEMES[s.scheme].text}>
            {s.title}
          </T>
          <foreignObject x={s.x + 12} y={104} width={152} height={44}>
            <div
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
                fontSize: 11.5,
                lineHeight: 1.35,
                color: INK,
                textAlign: "center",
              }}
            >
              {s.body}
            </div>
          </foreignObject>
        </g>
      ))}
      <Arrow x1={200} y1={92} x2={228} y2={92} scheme="ink" />
      <Arrow x1={412} y1={92} x2={440} y2={92} scheme="ink" />
      <T x={320} y={180} size={12} fill={MUTED}>
        Then come back and re-read it after your first design meeting, and again after your first scrimmage.
      </T>
    </svg>
  );
}

/* ---------- Chapter 3 ---------- */

export function BrainstormingSteps() {
  const steps = [
    "Analyze the game",
    "Generate raw ideas",
    "Research outward",
    "Debate every idea",
    "Scoring matrix",
    "First prototype",
  ];
  const schemes = ["purple", "purple", "teal", "teal", "amber", "amber"] as const;
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      {steps.map((s, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 22 + col * 205;
        const y = 30 + row * 106;
        return (
          <g key={i}>
            <Card x={x} y={y} w={182} h={76} scheme={schemes[i]} />
            <circle cx={x + 24} cy={y + 24} r={12} fill={SCHEMES[schemes[i]].solid} />
            <T x={x + 24} y={y + 24} size={11} weight={700} fill="#ffffff">
              {i + 1}
            </T>
            <T x={x + 91} y={y + 54} size={13} weight={600} fill={SCHEMES[schemes[i]].text}>
              {s}
            </T>
          </g>
        );
      })}
      <Arrow x1={206} y1={68} x2={224} y2={68} scheme="ink" />
      <Arrow x1={411} y1={68} x2={429} y2={68} scheme="ink" />
      <Arrow x1={206} y1={174} x2={224} y2={174} scheme="ink" />
      <Arrow x1={411} y1={174} x2={429} y2={174} scheme="ink" />
      <path d="M 590 110 Q 620 137 590 164" fill="none" stroke={MUTED} strokeWidth={1.75} markerEnd="url(#arrow-ink)" />
      <T x={320} y={232} size={12} fill={MUTED}>
        Ideas are free until something is real. Brainstorming ends the moment you start building.
      </T>
    </svg>
  );
}

/* ---------- Chapter 4 ---------- */

export function ResearchSources() {
  const sources = [
    { t: "Reveal videos", b: "Watch the build clips frame by frame, not just the matches.", s: "purple" as const },
    { t: "VEX Forum", b: "Official rule clarifications. Search before you post.", s: "teal" as const },
    { t: "YouTube channels", b: "Official season content, plus teams who post consistently.", s: "amber" as const },
    { t: "Discord servers", b: "Lurk first, read the pins, then ask.", s: "neutral" as const },
  ];
  return (
    <svg viewBox="0 0 640 240" className="h-auto w-full">
      <Defs />
      {sources.map((src, i) => {
        const x = 20 + (i % 2) * 310;
        const y = 20 + Math.floor(i / 2) * 108;
        return (
          <g key={i}>
            <Card x={x} y={y} w={290} h={92} scheme={src.s} filled={false} />
            <rect x={x + 14} y={y + 16} width={26} height={26} rx={7} fill={SCHEMES[src.s].bg} stroke={SCHEMES[src.s].solid} strokeWidth={1.5} />
            <circle cx={x + 27} cy={y + 29} r={4.5} fill={SCHEMES[src.s].solid} />
            <T x={x + 50} y={y + 29} size={14} weight={700} fill={SCHEMES[src.s].text} anchor="start">
              {src.t}
            </T>
            <foreignObject x={x + 14} y={y + 50} width={262} height={38}>
              <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 11.5, lineHeight: 1.4, color: INK }}>
                {src.b}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Chapter 5 ---------- */

function RobotBase({ x, y, wheels }: { x: number; y: number; wheels: "tank" | "holo" | "mec" }) {
  const positions = [
    [x - 34, y - 30],
    [x + 34, y - 30],
    [x - 34, y + 30],
    [x + 34, y + 30],
  ];
  return (
    <g>
      <rect x={x - 44} y={y - 46} width={88} height={92} rx={10} fill="#ffffff" stroke={MUTED} strokeWidth={1.5} />
      {positions.map(([wx, wy], i) => (
        <g key={i}>
          <rect x={wx - 9} y={wy - 15} width={18} height={30} rx={5} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={1.5} />
          {wheels === "mec" && (
            <line x1={wx - 6} y1={wy + 8} x2={wx + 6} y2={wy - 8} stroke={SCHEMES.purple.solid} strokeWidth={1.5} />
          )}
          {wheels === "holo" && (
            <circle cx={wx} cy={wy} r={4} fill="none" stroke={SCHEMES.purple.solid} strokeWidth={1.5} />
          )}
        </g>
      ))}
    </g>
  );
}

export function DriveTypes() {
  const panels = [
    { x: 106, name: "Tank", note: "Forward and turn.", arrows: "fb" },
    { x: 320, name: "Holonomic", note: "Any direction, including sideways.", arrows: "all" },
    { x: 534, name: "Mecanum", note: "Sideways too, with angled rollers.", arrows: "all" },
  ] as const;
  return (
    <svg viewBox="0 0 640 260" className="h-auto w-full">
      <Defs />
      {panels.map((p, i) => (
        <g key={i}>
          <RobotBase x={p.x} y={102} wheels={i === 0 ? "tank" : i === 1 ? "holo" : "mec"} />
          {p.arrows === "fb" ? (
            <>
              <Arrow x1={p.x} y1={48} x2={p.x} y2={22} scheme="teal" />
              <Arrow x1={p.x} y1={156} x2={p.x} y2={182} scheme="teal" />
            </>
          ) : (
            <>
              <Arrow x1={p.x} y1={48} x2={p.x} y2={22} scheme="teal" />
              <Arrow x1={p.x} y1={156} x2={p.x} y2={182} scheme="teal" />
              <Arrow x1={p.x + 50} y1={102} x2={p.x + 82} y2={102} scheme="teal" />
              <Arrow x1={p.x - 50} y1={102} x2={p.x - 82} y2={102} scheme="teal" />
            </>
          )}
          <T x={p.x} y={208} size={14} weight={700} fill={INK}>
            {p.name}
          </T>
          <foreignObject x={p.x - 100} y={218} width={200} height={38}>
            <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 11.5, lineHeight: 1.35, color: MUTED, textAlign: "center" }}>
              {p.note}
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}

export function SpeedTorqueTradeoff() {
  return (
    <svg viewBox="0 0 640 220" className="h-auto w-full">
      <Defs />
      <Gear cx={168} cy={92} r={34} teeth={10} color={SCHEMES.amber.solid} />
      <Gear cx={262} cy={92} r={20} teeth={7} color={SCHEMES.purple.solid} />
      <T x={168} y={158} size={13} weight={700} fill={SCHEMES.amber.text}>
        Big driven gear
      </T>
      <T x={168} y={177} size={11.5} fill={MUTED}>
        slower, more torque
      </T>
      <T x={286} y={158} size={13} weight={700} fill={SCHEMES.purple.text} anchor="start">
        Small driven gear
      </T>
      <T x={286} y={177} size={11.5} fill={MUTED} anchor="start">
        faster, less torque
      </T>

      <line x1={370} y1={92} x2={612} y2={92} stroke="#e5e5e5" strokeWidth={10} strokeLinecap="round" />
      <line x1={370} y1={92} x2={612} y2={92} stroke="url(#stgrad)" strokeWidth={10} strokeLinecap="round" opacity={0.45} />
      <defs>
        <linearGradient id="stgrad" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--purple)" />
          <stop offset="100%" stopColor="var(--amber)" />
        </linearGradient>
      </defs>
      <circle cx={491} cy={92} r={9} fill="#ffffff" stroke={INK} strokeWidth={2} />
      <T x={370} y={62} size={12} weight={600} fill={SCHEMES.purple.text} anchor="start">
        Speed
      </T>
      <T x={612} y={62} size={12} weight={600} fill={SCHEMES.amber.text} anchor="end">
        Torque
      </T>
      <T x={491} y={124} size={11.5} fill={MUTED}>
        every ratio sits somewhere on this line
      </T>
      <T x={491} y={177} size={12} weight={600} fill={INK}>
        Build the ratio for the robot&apos;s final weight.
      </T>
    </svg>
  );
}

/* ---------- Chapters 6 and 7 ---------- */

export function ScoringCycle() {
  const stops = [
    { x: 116, y: 86, t: "Intake", s: "purple" as const, n: "Grab the game element." },
    { x: 524, y: 86, t: "Transport", s: "teal" as const, n: "Move it through the robot." },
    { x: 524, y: 194, t: "Outtake", s: "amber" as const, n: "Release it where it counts." },
    { x: 116, y: 194, t: "Reset", s: "neutral" as const, n: "Get back for the next one." },
  ];
  return (
    <svg viewBox="0 0 640 280" className="h-auto w-full">
      <Defs />
      <Arrow x1={196} y1={86} x2={444} y2={86} scheme="purple" />
      <Arrow x1={524} y1={110} x2={524} y2={170} scheme="teal" />
      <Arrow x1={444} y1={194} x2={196} y2={194} scheme="amber" />
      <Arrow x1={116} y1={170} x2={116} y2={110} scheme="neutral" />
      {stops.map((s, i) => {
        // Captions sit outside the loop, above the top row and below the bottom
        // row, so the vertical arrows between them stay clear of the text.
        const capY = s.y < 130 ? s.y - 54 : s.y + 24;
        return (
          <g key={i}>
            <rect x={s.x - 80} y={s.y - 21} width={160} height={42} rx={10} fill={SCHEMES[s.s].bg} stroke={SCHEMES[s.s].solid} strokeWidth={1.5} />
            <T x={s.x} y={s.y} size={14} weight={700} fill={SCHEMES[s.s].text}>
              {s.t}
            </T>
            <foreignObject x={s.x - 90} y={capY} width={180} height={34}>
              <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 11, lineHeight: 1.3, color: MUTED, textAlign: "center" }}>
                {s.n}
              </div>
            </foreignObject>
          </g>
        );
      })}
      <T x={320} y={132} size={12.5} weight={600} fill={INK}>
        One scoring cycle
      </T>
      <T x={320} y={151} size={11} fill={MUTED}>
        faster cycles multiply across a match
      </T>
    </svg>
  );
}

export function TradeoffTriangle() {
  const A = { x: 320, y: 46 };
  const B = { x: 172, y: 186 };
  const C = { x: 468, y: 186 };
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      <path
        d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`}
        fill="#fafaf9"
        stroke="#e5e5e5"
        strokeWidth={2}
      />
      {[
        { p: A, label: "Speed", s: "purple" as const, dy: -22 },
        { p: B, label: "Precision", s: "teal" as const, dy: 26 },
        { p: C, label: "Simplicity", s: "amber" as const, dy: 26 },
      ].map((v, i) => (
        <g key={i}>
          <circle cx={v.p.x} cy={v.p.y} r={11} fill={SCHEMES[v.s].solid} stroke="#ffffff" strokeWidth={3} />
          <T x={v.p.x} y={v.p.y + v.dy} size={13} weight={700} fill={SCHEMES[v.s].text}>
            {v.label}
          </T>
        </g>
      ))}
      <T x={320} y={132} size={12.5} weight={700} fill={INK}>
        Pick two
      </T>
      <T x={320} y={224} size={11.5} fill={MUTED}>
        Every outtake type trades one of these away. None of them give you all three.
      </T>
    </svg>
  );
}

/* ---------- Chapter 8 ---------- */

export function FusionSpectrum() {
  const marks = [
    { p: 0.06, season: "Full Volume", note: "Fully separate", s: "teal" as const },
    { p: 0.36, season: "Slapshot", note: "One fusion", s: "teal" as const },
    { p: 0.64, season: "Mix and Match", note: "Two fused", s: "amber" as const },
    { p: 0.95, season: "Rapid Relay", note: "Nearly all of it", s: "purple" as const },
  ];
  const x0 = 60;
  const x1 = 580;
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      <line x1={x0} y1={104} x2={x1} y2={104} stroke="#e5e5e5" strokeWidth={8} strokeLinecap="round" />
      <T x={x0} y={72} size={12.5} weight={700} fill={SCHEMES.teal.text} anchor="start">
        Modular
      </T>
      <T x={x0} y={90} size={11} fill={MUTED} anchor="start">
        own timing and speed
      </T>
      <T x={x1} y={72} size={12.5} weight={700} fill={SCHEMES.purple.text} anchor="end">
        Fused
      </T>
      <T x={x1} y={90} size={11} fill={MUTED} anchor="end">
        shares a motor
      </T>
      {marks.map((m, i) => {
        const x = x0 + (x1 - x0) * m.p;
        const up = i % 2 === 0;
        const ty = up ? 148 : 190;
        return (
          <g key={i}>
            <circle cx={x} cy={104} r={9} fill={SCHEMES[m.s].solid} stroke="#ffffff" strokeWidth={3} />
            <line x1={x} y1={113} x2={x} y2={ty - 22} stroke={SCHEMES[m.s].solid} strokeWidth={1.25} strokeDasharray="3 3" />
            <T x={x} y={ty - 8} size={12.5} weight={700} fill={INK}>
              {m.season}
            </T>
            <T x={x} y={ty + 9} size={11} fill={MUTED}>
              {m.note}
            </T>
          </g>
        );
      })}
      <T x={320} y={38} size={13} weight={600} fill={INK}>
        Integration is a dial, not a switch.
      </T>
      <T x={320} y={228} size={11.5} fill={MUTED}>
        Ask which functions conflict before fusing. Share the motor if they do not.
      </T>
    </svg>
  );
}

/* ---------- Chapter 9 ---------- */

export function PtoBuildOrder() {
  return (
    <svg viewBox="0 0 640 200" className="h-auto w-full">
      <Defs />
      <Card x={24} y={44} w={250} h={80} scheme="teal" />
      <path d="M 52 84 l 9 10 l 18 -21" fill="none" stroke={SCHEMES.teal.solid} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <T x={168} y={76} size={13.5} weight={700} fill={SCHEMES.teal.text}>
        Base robot scores reliably
      </T>
      <T x={168} y={97} size={11.5} fill={MUTED}>
        drivetrain and mechanisms, on their own
      </T>

      <Arrow x1={282} y1={84} x2={318} y2={84} scheme="ink" />

      <Card x={326} y={44} w={250} h={80} scheme="purple" />
      <circle cx={356} cy={84} r={13} fill={SCHEMES.purple.solid} />
      <T x={356} y={84} size={11} weight={700} fill="#ffffff">
        +
      </T>
      <T x={466} y={76} size={13.5} weight={700} fill={SCHEMES.purple.text}>
        Then add the PTO
      </T>
      <T x={466} y={97} size={11.5} fill={MUTED}>
        a late-season speed upgrade
      </T>

      <T x={320} y={158} size={12.5} weight={600} fill={INK}>
        A PTO does not rescue a struggling robot. It makes a working robot faster.
      </T>
      <T x={320} y={178} size={11.5} fill={MUTED}>
        Bolt one onto a shaky robot and you get a shaky robot with extra friction.
      </T>
    </svg>
  );
}

export function PtoTypes() {
  const types = [
    { n: "Differential", dirs: "Two directions", sw: "Fast switching", cost: "Heavy, lots of space", s: "purple" as const },
    { n: "Slide", dirs: "Two directions", sw: "Swift switching", cost: "Needs pneumatics, big", s: "teal" as const },
    { n: "Gravity", dirs: "One direction", sw: "Slower switching", cost: "No pneumatics, easy", s: "amber" as const },
    { n: "Latch", dirs: "Two directions", sw: "Slower switching", cost: "Easy build, more space", s: "neutral" as const },
  ];
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      {types.map((t, i) => {
        const x = 14 + i * 156;
        return (
          <g key={i}>
            <Card x={x} y={18} w={144} h={196} scheme={t.s} filled={false} />
            <rect x={x} y={18} width={144} height={38} rx={10} fill={SCHEMES[t.s].bg} />
            <T x={x + 72} y={38} size={13.5} weight={700} fill={SCHEMES[t.s].text}>
              {t.n}
            </T>
            <T x={x + 72} y={84} size={11.5} weight={600} fill={INK}>
              {t.dirs}
            </T>
            <line x1={x + 20} y1={104} x2={x + 124} y2={104} stroke="#e5e5e5" strokeWidth={1} />
            <T x={x + 72} y={126} size={11.5} weight={600} fill={INK}>
              {t.sw}
            </T>
            <line x1={x + 20} y1={146} x2={x + 124} y2={146} stroke="#e5e5e5" strokeWidth={1} />
            <foreignObject x={x + 12} y={158} width={120} height={48}>
              <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 11, lineHeight: 1.35, color: MUTED, textAlign: "center" }}>
                {t.cost}
              </div>
            </foreignObject>
          </g>
        );
      })}
      <T x={320} y={236} size={11.5} fill={MUTED}>
        Pick on space and speed. Friction is the real enemy, differentials most of all.
      </T>
    </svg>
  );
}

export function PtoPowerSplit() {
  return (
    <svg viewBox="0 0 640 270" className="h-auto w-full">
      <Defs />
      <T x={162} y={24} size={13} weight={700} fill={INK}>
        Driving
      </T>
      <T x={478} y={24} size={13} weight={700} fill={INK}>
        Scoring
      </T>

      {[0, 1].map((panel) => {
        const ox = panel * 316;
        const driveMotors = panel === 0 ? 4 : 2;
        return (
          <g key={panel}>
            <rect x={20 + ox} y={44} width={284} height={172} rx={12} fill="#ffffff" stroke="#e5e5e5" strokeWidth={1.5} />
            {Array.from({ length: 4 }, (_, i) => {
              const on = i < driveMotors;
              return (
                <g key={i}>
                  <rect
                    x={40 + ox + i * 42}
                    y={64}
                    width={32}
                    height={32}
                    rx={8}
                    fill={on ? SCHEMES.purple.bg : "#fafaf9"}
                    stroke={on ? SCHEMES.purple.solid : "#d6d3d1"}
                    strokeWidth={1.5}
                  />
                  <T x={56 + ox + i * 42} y={80} size={10.5} weight={700} fill={on ? SCHEMES.purple.text : "#a8a29e"}>
                    M
                  </T>
                </g>
              );
            })}
            <T x={162 + ox} y={116} size={11.5} weight={600} fill={SCHEMES.purple.text}>
              {driveMotors} to the drivetrain
            </T>
            <line x1={40 + ox} y1={134} x2={284 + ox} y2={134} stroke="#e5e5e5" strokeWidth={1} />
            {Array.from({ length: 2 }, (_, i) => {
              const on = panel === 1;
              return (
                <g key={i}>
                  <rect
                    x={120 + ox + i * 42}
                    y={148}
                    width={32}
                    height={32}
                    rx={8}
                    fill={on ? SCHEMES.teal.bg : "#fafaf9"}
                    stroke={on ? SCHEMES.teal.solid : "#d6d3d1"}
                    strokeWidth={1.5}
                  />
                  <T x={136 + ox + i * 42} y={164} size={10.5} weight={700} fill={on ? SCHEMES.teal.text : "#a8a29e"}>
                    M
                  </T>
                </g>
              );
            })}
            <T x={162 + ox} y={200} size={11.5} weight={600} fill={panel === 1 ? SCHEMES.teal.text : "#a8a29e"}>
              {panel === 1 ? "2 borrowed for the lift" : "0 to the lift"}
            </T>
          </g>
        );
      })}

      <g>
        <rect x={286} y={112} width={68} height={36} rx={18} fill={SCHEMES.amber.bg} stroke={SCHEMES.amber.solid} strokeWidth={1.5} />
        <T x={320} y={130} size={10.5} weight={700} fill={SCHEMES.amber.text}>
          PTO
        </T>
      </g>

      <T x={320} y={244} size={11.5} fill={MUTED}>
        Mix and Match: field speed nearly doubled, because driving and scoring never happen at the same instant.
      </T>
    </svg>
  );
}

/* ---------- Chapter 10 ---------- */

export function PneumaticBinary() {
  return (
    <svg viewBox="0 0 640 220" className="h-auto w-full">
      <Defs />
      <Card x={20} y={22} w={288} h={148} scheme="teal" filled={false} />
      <Pill x={164} y={48} label="Motor" scheme="teal" w={80} />
      <line x1={54} y1={104} x2={274} y2={104} stroke="#e5e5e5" strokeWidth={8} strokeLinecap="round" />
      {[54, 109, 164, 219, 274].map((x, i) => (
        <circle key={i} cx={x} cy={104} r={5} fill={SCHEMES.teal.solid} />
      ))}
      <T x={164} y={136} size={12} weight={600} fill={INK}>
        Stops anywhere you want
      </T>
      <T x={164} y={155} size={11} fill={MUTED}>
        use it when you need many positions
      </T>

      <Card x={332} y={22} w={288} h={148} scheme="purple" filled={false} />
      <Pill x={476} y={48} label="Cylinder" scheme="purple" w={92} />
      <rect x={378} y={92} width={90} height={24} rx={6} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={1.5} />
      <rect x={468} y={98} width={72} height={12} rx={6} fill={SCHEMES.purple.solid} />
      <circle cx={556} cy={104} r={9} fill="#ffffff" stroke={SCHEMES.purple.solid} strokeWidth={2} />
      <T x={402} y={136} size={12} weight={600} fill={INK} anchor="start">
        In, or out. Nothing between.
      </T>
      <T x={476} y={155} size={11} fill={MUTED}>
        but it fires faster than a motor can move
      </T>
    </svg>
  );
}

/* ---------- Chapter 11 ---------- */

export function NotebookEntryTypes() {
  const kinds = [
    { t: "Decision", s: "purple" as const, b: "What you chose, and the number behind it." },
    { t: "Log", s: "teal" as const, b: "What happened at this meeting." },
    { t: "Reference", s: "amber" as const, b: "Something to look up again later." },
  ];
  return (
    <svg viewBox="0 0 640 220" className="h-auto w-full">
      <Defs />
      {kinds.map((k, i) => {
        const x = 20 + i * 206;
        return (
          <g key={i}>
            <Card x={x} y={22} w={188} h={128} scheme={k.s} filled={false} />
            <rect x={x} y={22} width={8} height={128} rx={4} fill={SCHEMES[k.s].solid} />
            <Pill x={x + 100} y={50} label={k.t} scheme={k.s} />
            <foreignObject x={x + 22} y={70} width={154} height={64}>
              <div style={{ fontFamily: "var(--font-body), system-ui, sans-serif", fontSize: 12, lineHeight: 1.4, color: INK, textAlign: "center" }}>
                {k.b}
              </div>
            </foreignObject>
          </g>
        );
      })}
      <T x={320} y={178} size={12.5} weight={600} fill={INK}>
        Every entry gets a title, a name, and a date.
      </T>
      <T x={320} y={198} size={11.5} fill={MUTED}>
        That is the only rule that keeps a deck with six people writing in it searchable later.
      </T>
    </svg>
  );
}

/* ---------- Chapter 12 ---------- */

export function TeamStructure() {
  const roles = [
    { x: 92, label: "Build" },
    { x: 244, label: "Drive" },
    { x: 396, label: "Code" },
    { x: 548, label: "Notebook" },
  ];
  return (
    <svg viewBox="0 0 640 250" className="h-auto w-full">
      <Defs />
      <circle cx={320} cy={64} r={46} fill={SCHEMES.purple.bg} stroke={SCHEMES.purple.solid} strokeWidth={2} />
      <T x={320} y={56} size={12.5} weight={700} fill={SCHEMES.purple.text}>
        Everyone
      </T>
      <T x={320} y={74} size={11} fill={SCHEMES.purple.text}>
        does everything
      </T>
      {roles.map((r, i) => (
        <g key={i}>
          <line x1={320} y1={110} x2={r.x} y2={158} stroke={SCHEMES.teal.solid} strokeWidth={1.5} strokeDasharray="4 4" />
          <rect x={r.x - 62} y={158} width={124} height={44} rx={10} fill={SCHEMES.teal.bg} stroke={SCHEMES.teal.solid} strokeWidth={1.5} />
          <T x={r.x} y={180} size={12.5} weight={600} fill={SCHEMES.teal.text}>
            {r.label} lead
          </T>
        </g>
      ))}
      <T x={320} y={228} size={11.5} fill={MUTED}>
        Specialists earn a lane once they are clearly better at it. Leading an area is not owning it.
      </T>
    </svg>
  );
}
