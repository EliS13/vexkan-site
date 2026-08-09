"use client";

import { useId, useState } from "react";
import {
  Program,
  V5_CARTRIDGES,
  V5_MOTOR_5W,
  V5_MOTOR_11W_WATTS,
  V5_DRIVETRAIN_WATT_CAP,
  IQ_MOTOR,
  IQ_WHEEL_SIZES,
  V5_WHEEL_SIZES,
  wheelRadiusMetres,
  MU_OMNI,
  MU_TRACTION,
  LBF_PER_NEWTON,
  NEWTON_PER_LB,
  IQ_GEAR_TEETH,
  V5_GEAR_TEETH,
} from "@/content/motors";

/**
 * Groups of buttons and selects under one heading. Uses a fieldset so screen
 * readers announce the group name with each control, rather than leaving them
 * unlabelled the way a bare sibling <label> does.
 */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="text-sm font-semibold text-[var(--ink-body)]">{label}</legend>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>}
    </fieldset>
  );
}

function Choice({
  active,
  onClick,
  children,
  color = "var(--purple)",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
      style={
        active
          ? { background: color, color: "white", borderColor: color }
          : { borderColor: "var(--line)", color: "#404040" }
      }
    >
      {children}
    </button>
  );
}

function Stepper({
  value,
  onChange,
  max,
  label,
  sub,
  step = 1,
}: {
  value: number;
  /** Takes a setState so fast repeated clicks each land, instead of sharing a stale value. */
  onChange: React.Dispatch<React.SetStateAction<number>>;
  max: number;
  label: string;
  sub: string;
  /** Wheels move in twos, because they go on in left and right pairs. */
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ borderColor: "var(--line)" }}>
      <div>
        <p className="text-sm font-medium text-[var(--ink-body)]">{label}</p>
        <p className="text-xs text-muted">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange((v) => Math.max(0, v - step))}
          aria-label={`Remove ${step} ${label}`}
          className="h-8 w-8 rounded-md border text-lg leading-none text-muted transition-colors hover:bg-[#efece7]"
          style={{ borderColor: "var(--line)" }}
        >
          &minus;
        </button>
        <span className="readout w-6 text-center text-base font-semibold text-foreground">{value}</span>
        <button
          onClick={() => onChange((v) => Math.min(max, v + step))}
          aria-label={`Add ${step} ${label}`}
          className="h-8 w-8 rounded-md border text-lg leading-none text-muted transition-colors hover:bg-[#efece7]"
          style={{ borderColor: "var(--line)" }}
        >
          +
        </button>
      </div>
    </div>
  );
}

const selectClass = "w-full rounded-lg border bg-white px-3 py-2 text-sm";

export function GearRatioCalculator() {
  const [program, setProgram] = useState<Program>("V5");

  // IQ state
  const [iqMotors, setIqMotors] = useState(4);
  const [iqWheelId, setIqWheelId] = useState("iq-200");
  const [iqOmni, setIqOmni] = useState(2);
  const [iqTraction, setIqTraction] = useState(2);
  const [iqWeight, setIqWeight] = useState("4");
  const [iqDriving, setIqDriving] = useState(12);
  const [iqDriven, setIqDriven] = useState(12);

  // V5 state
  const [count11, setCount11] = useState(4);
  const [count55, setCount55] = useState(0);
  const [cartridgeId, setCartridgeId] = useState("green");
  const [v5WheelId, setV5WheelId] = useState("v5-325");
  const [v5Omni, setV5Omni] = useState(6);
  const [v5Traction, setV5Traction] = useState(2);
  const [v5Weight, setV5Weight] = useState("15");
  const [v5Driving, setV5Driving] = useState(12);
  const [v5Driven, setV5Driven] = useState(12);

  const weightId = useId();
  const isIQ = program === "IQ";
  const cartridge = V5_CARTRIDGES.find((c) => c.id === cartridgeId) ?? V5_CARTRIDGES[1];
  const iqWheel = IQ_WHEEL_SIZES.find((w) => w.id === iqWheelId) ?? IQ_WHEEL_SIZES[2];
  const v5Wheel = V5_WHEEL_SIZES.find((w) => w.id === v5WheelId) ?? V5_WHEEL_SIZES[1];
  const wheel = isIQ ? iqWheel : v5Wheel;

  const omniCount = isIQ ? iqOmni : v5Omni;
  const tractionCount = isIQ ? iqTraction : v5Traction;
  const wheelTotal = omniCount + tractionCount;
  const weightInput = isIQ ? iqWeight : v5Weight;
  // Empty is allowed while typing, it just falls back for the maths.
  const weightLb = Number(weightInput) > 0 ? Number(weightInput) : 0;
  const setOmni = isIQ ? setIqOmni : setV5Omni;
  const setTraction = isIQ ? setIqTraction : setV5Traction;
  const setWeight = isIQ ? setIqWeight : setV5Weight;

  const reduction = isIQ ? iqDriven / iqDriving : v5Driven / v5Driving;

  // Free speed of the drive shaft before external gearing.
  const sourceRpm = isIQ ? IQ_MOTOR.rpm : count11 > 0 ? cartridge.rpm : V5_MOTOR_5W.rpm;
  const wheelRpm = sourceRpm / reduction;

  const speedInPerSec = isIQ
    ? (wheelRpm * (iqWheel.travelMm ?? 0)) / 60 / 25.4
    : (wheelRpm * Math.PI * (v5Wheel.diameterInches ?? 0)) / 60;


  const stallSum = isIQ
    ? IQ_MOTOR.stallTorque * iqMotors
    : cartridge.stallTorque * count11 + V5_MOTOR_5W.stallTorque * count55;
  const motorCount = isIQ ? iqMotors : count11 + count55;
  const driveTorque = stallSum * reduction;

  // Two separate ceilings on pushing force. The lower one is what you actually get.
  const radiusM = wheelRadiusMetres(wheel);
  const motorForceN = radiusM > 0 ? driveTorque / radiusM : 0;
  const muEffective =
    wheelTotal > 0 ? (omniCount * MU_OMNI + tractionCount * MU_TRACTION) / wheelTotal : MU_OMNI;
  const gripForceN = muEffective * weightLb * NEWTON_PER_LB;
  const pushForceN = Math.min(motorForceN, gripForceN);
  const gripLimited = gripForceN < motorForceN;
  const pushLbf = pushForceN * LBF_PER_NEWTON;

  const wattsUsed = count11 * V5_MOTOR_11W_WATTS + count55 * V5_MOTOR_5W.watts;
  const overCap = wattsUsed > V5_DRIVETRAIN_WATT_CAP;
  const mixedSpeedClash = !isIQ && count55 > 0 && count11 > 0 && cartridge.rpm !== V5_MOTOR_5W.rpm;

  // The 62 / 70 in-sec guidance comes from the V5RC drivetrain chapter.
  const speedNote = !isIQ
    ? speedInPerSec > 70
      ? { text: "Past about 70 in/sec. The book's rule of thumb says this needs excellent driving and a very stiff robot to stay usable.", bg: "#fee2e2", color: "#991b1b", label: "Hard to control" }
      : speedInPerSec > 62
        ? { text: "Past about 62 in/sec. Still drivable, but control gets noticeably harder from here.", bg: "var(--amber-bg)", color: "var(--amber-text)", label: "Getting fast" }
        : { text: "Under about 62 in/sec. The book's rule of thumb says this stays controllable on almost any build.", bg: "var(--teal-bg)", color: "var(--teal-text)", label: "Controllable" }
    : { text: "IQ has no published speed threshold like V5RC does. Judge it against your own driving and how heavy the robot ends up.", bg: "var(--purple-bg)", color: "var(--purple-text)", label: "VEX IQ" };

  const teeth = isIQ ? IQ_GEAR_TEETH : V5_GEAR_TEETH;

  /**
   * The cartridge shifts speed and torque just as much as the gears do, so the
   * balance has to account for both. A red cartridge is already a 6x reduction
   * against a blue one before you fit a single gear.
   */
  const fastestRpm = isIQ ? IQ_MOTOR.rpm : Math.max(...V5_CARTRIDGES.map((c) => c.rpm));
  const slowestRpm = isIQ ? IQ_MOTOR.rpm : Math.min(...V5_CARTRIDGES.map((c) => c.rpm));
  const cartridgeFactor = fastestRpm / sourceRpm;
  const effectiveReduction = cartridgeFactor * reduction;

  // Normalise against everything this program could actually be geared to.
  const minTeeth = Math.min(...teeth);
  const maxTeeth = Math.max(...teeth);
  const minEffective = minTeeth / maxTeeth;
  const maxEffective = (fastestRpm / slowestRpm) * (maxTeeth / minTeeth);
  const span = Math.log2(maxEffective) - Math.log2(minEffective);
  const balance = Math.max(
    0,
    Math.min(1, (Math.log2(effectiveReduction) - Math.log2(minEffective)) / span)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6 rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
        <Field label="Program">
          <div className="flex gap-2">
            <Choice active={isIQ} onClick={() => setProgram("IQ")}>
              VEX IQ
            </Choice>
            <Choice active={!isIQ} onClick={() => setProgram("V5")}>
              V5RC
            </Choice>
          </div>
        </Field>

        {isIQ ? (
          <Field label="Motors on the drivetrain" hint="The IQ Smart Motor runs at one fixed speed, 120 RPM.">
            <Stepper
              value={iqMotors}
              onChange={setIqMotors}
              max={8}
              label="IQ Smart Motor"
              sub={`${IQ_MOTOR.rpm} RPM · ${IQ_MOTOR.stallTorque} N·m each`}
            />
          </Field>
        ) : (
          <>
            <Field
              label="Drivetrain motors"
              hint="Mix motor types however you like. The 5.5W runs at a fixed 200 RPM and takes no cartridge."
            >
              <div className="space-y-2">
                <Stepper
                  value={count11}
                  onChange={setCount11}
                  max={8}
                  label="11W Smart Motor"
                  sub={`${V5_MOTOR_11W_WATTS}W each · cartridge below`}
                />
                <Stepper
                  value={count55}
                  onChange={setCount55}
                  max={8}
                  label="5.5W Smart Motor"
                  sub={`${V5_MOTOR_5W.watts}W each · fixed ${V5_MOTOR_5W.rpm} RPM`}
                />
              </div>

              <div className="mt-3 rounded-lg border p-3" style={{ borderColor: overCap ? "#dc2626" : "var(--line)" }}>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Drivetrain power
                  </span>
                  <span
                    className="readout text-sm font-bold"
                    style={{ color: overCap ? "#991b1b" : "var(--teal-text)" }}
                  >
                    {wattsUsed}W / {V5_DRIVETRAIN_WATT_CAP}W
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#eae6e0]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (wattsUsed / V5_DRIVETRAIN_WATT_CAP) * 100)}%`,
                      background: overCap ? "#dc2626" : "var(--teal)",
                    }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: overCap ? "#991b1b" : "#737373" }}>
                  {overCap
                    ? `Over the cap by ${(wattsUsed - V5_DRIVETRAIN_WATT_CAP).toFixed(1)}W. This drivetrain would not be legal.`
                    : `${(V5_DRIVETRAIN_WATT_CAP - wattsUsed).toFixed(1)}W of headroom left. V5RC Override caps drivetrain motors at ${V5_DRIVETRAIN_WATT_CAP}W, always re-check the current game manual.`}
                </p>
              </div>
            </Field>

            <Field
              label="Cartridge (11W motors)"
              hint={count11 === 0 ? "Add an 11W motor to choose a cartridge." : "The cartridge changes the motor's internal gearing, so speed and torque move in opposite directions."}
            >
              <div className="flex flex-wrap gap-2">
                {V5_CARTRIDGES.map((c) => (
                  <Choice key={c.id} active={cartridge.id === c.id} onClick={() => setCartridgeId(c.id)}>
                    {c.label}
                  </Choice>
                ))}
              </div>
            </Field>

            {mixedSpeedClash && (
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--amber)", background: "var(--amber-bg)" }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--amber-text)" }}>
                  Speeds do not match
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-body)]">
                  Your 11W motors want {cartridge.rpm} RPM but the 5.5W motors are stuck at {V5_MOTOR_5W.rpm} RPM.
                  Linked to the same wheels, the slower motors get dragged along and fight the faster ones.
                  Either use a 200 RPM cartridge, or gear the two groups separately so they end up at the same
                  wheel speed.
                </p>
              </div>
            )}
          </>
        )}

        <Field
          label="Wheel"
          hint={
            isIQ
              ? "IQ wheels are named by how far the robot travels in one full turn, not by diameter."
              : "V5 wheels are named by diameter."
          }
        >
          <select
            value={isIQ ? iqWheelId : v5WheelId}
            onChange={(e) => (isIQ ? setIqWheelId(e.target.value) : setV5WheelId(e.target.value))}
            aria-label="Wheel size"
            className={selectClass}
            style={{ borderColor: "var(--line)" }}
          >
            {(isIQ ? IQ_WHEEL_SIZES : V5_WHEEL_SIZES).map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
          {wheel.note && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{wheel.note}</p>
          )}

          {!isIQ && (
            <>
          <div className="mt-3 space-y-2">
            <Stepper
              value={omniCount}
              onChange={setOmni}
              max={12}
              step={2}
              label="Omni wheels"
              sub={`grip about ${MU_OMNI} on foam`}
            />
            <Stepper
              value={tractionCount}
              onChange={setTraction}
              max={12}
              step={2}
              label="Traction wheels"
              sub={`grip about ${MU_TRACTION} on foam`}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Wheels go on in left and right pairs, so these move in twos. Odd numbers would leave one
            side grippier than the other and the robot would pull. Omni wheels roll sideways, which
            is what makes turning easy, but they give up grip. Swap a pair for traction and your
            pushing power goes up.
          </p>

          <div className="mt-3">
            <label className="text-xs font-medium text-muted" htmlFor={weightId}>
              Robot weight (lb)
            </label>
            <input
              id={weightId}
              type="number"
              min={1}
              value={weightInput}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="15"
              className={`${selectClass} mt-1`}
              style={{ borderColor: "var(--line)" }}
            />
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Grip depends on weight pressing the wheels into the tiles, so a heavier robot can
              actually push harder, right up until the motors run out.
            </p>
          </div>
            </>
          )}
          {isIQ && (
            <p className="mt-2 text-xs leading-relaxed text-muted">
              IQ drivetrains are almost always four wheels, and IQ is not a pushing game, so wheel
              counts and grip are left out here. Omni versus traction in IQ is about how easily the
              robot turns, not about winning a shoving match.
            </p>
          )}
        </Field>

        <Field
          label="External gear ratio"
          hint={`Only tooth counts VEX actually sells for ${isIQ ? "IQ" : "V5"}, so every ratio here is one you can really build.`}
        >
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-muted">Driving (on motor)</p>
              <select
                value={isIQ ? iqDriving : v5Driving}
                onChange={(e) => (isIQ ? setIqDriving(Number(e.target.value)) : setV5Driving(Number(e.target.value)))}
                aria-label="Driving gear, teeth"
                className={selectClass}
                style={{ borderColor: "var(--line)" }}
              >
                {teeth.map((t) => (
                  <option key={t} value={t}>
                    {t}T
                  </option>
                ))}
              </select>
            </div>
            <span className="pb-2 text-[var(--muted)]">:</span>
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-muted">Driven (on wheel)</p>
              <select
                value={isIQ ? iqDriven : v5Driven}
                onChange={(e) => (isIQ ? setIqDriven(Number(e.target.value)) : setV5Driven(Number(e.target.value)))}
                aria-label="Driven gear, teeth"
                className={selectClass}
                style={{ borderColor: "var(--line)" }}
              >
                {teeth.map((t) => (
                  <option key={t} value={t}>
                    {t}T
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold" style={{ color: "var(--purple-text)" }}>
            {reduction === 1
              ? "1:1, direct drive"
              : reduction > 1
                ? `${reduction.toFixed(2)}:1 reduction, geared for torque`
                : `1:${(1 / reduction).toFixed(2)}, geared for speed`}
          </p>
        </Field>
      </div>

      <div className="space-y-4">
        {motorCount === 0 && (
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "var(--amber)", background: "var(--amber-bg)" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--amber-text)" }}>
              No motors on the drivetrain
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-body)]">
              Add at least one motor to see speed and pushing power. A robot with no drive motors
              does not move, whatever the gearing says.
            </p>
          </div>
        )}

        {motorCount > 0 && (
        <div className="rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow" style={{ color: "var(--muted)" }}>
                Estimated top speed
              </p>
              <p className="readout mt-1 text-[2.1rem] font-semibold text-foreground">
                {speedInPerSec.toFixed(1)}{" "}
                <span className="font-sans text-base font-normal" style={{ color: "var(--muted)" }}>in/sec</span>
              </p>
              {isIQ && (
                <p className="text-sm text-muted">
                  {((speedInPerSec * 25.4) / 10).toFixed(1)} cm/sec
                </p>
              )}
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{ background: speedNote.bg, color: speedNote.color }}
            >
              {speedNote.label}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{speedNote.text}</p>
        </div>
        )}

        {!isIQ && motorCount > 0 && (
        <div className="rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow" style={{ color: "var(--muted)" }}>
                Pushing force at the floor
              </p>
              <p className="readout mt-1 text-[2.1rem] font-semibold text-foreground">
                {pushLbf.toFixed(1)} <span className="font-sans text-base font-normal" style={{ color: "var(--muted)" }}>lb of push</span>
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={
                gripLimited
                  ? { background: "var(--amber-bg)", color: "var(--amber-text)" }
                  : { background: "var(--teal-bg)", color: "var(--teal-text)" }
              }
            >
              {gripLimited ? "Grip limited" : "Motor limited"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {gripLimited
              ? `Your wheels slip before your motors give up. Adding motors will not help here, but swapping omni wheels for traction will. Right now ${tractionCount} of ${wheelTotal} wheels are traction.`
              : `Your motors run out before the wheels slip, so you have grip to spare. More motors or a torquier ratio would actually push harder.`}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <div>
              <p className="eyebrow text-[var(--muted)]">
                Motors could give
              </p>
              <p className="readout text-sm font-semibold text-foreground">
                {(motorForceN * LBF_PER_NEWTON).toFixed(1)} lb
              </p>
            </div>
            <div>
              <p className="eyebrow text-[var(--muted)]">
                Wheels can grip
              </p>
              <p className="readout text-sm font-semibold text-foreground">
                {(gripForceN * LBF_PER_NEWTON).toFixed(1)} lb
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Average grip across your wheels is about {muEffective.toFixed(2)}. Stall torque at the
            wheels is {driveTorque.toFixed(2)}&nbsp;N&middot;m. These assume weight sits evenly on every
            wheel, which is never quite true.
          </p>
        </div>
        )}

        <div className="rounded-xl border bg-surface p-5" style={{ borderColor: "var(--line)" }}>
          <p className="eyebrow" style={{ color: "var(--muted)" }}>
            Speed vs. torque balance
          </p>
          <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-[#eae6e0]">
            <div
              className="h-full w-full rounded-full opacity-30"
              style={{ background: "linear-gradient(90deg, var(--amber), var(--purple))" }}
            />
            <div
              className="absolute inset-y-0 w-1.5 rounded-full transition-all"
              style={{ left: `calc(${balance * 100}% - 3px)`, background: "var(--purple)" }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted">
            <span>More speed</span>
            <span>More torque</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Wheels turn at {wheelRpm.toFixed(0)} RPM.{" "}
            {!isIQ && count11 > 0 && (
              <>
                The {cartridge.label.replace(/ \(.*\)/, "")} cartridge is worth{" "}
                {cartridgeFactor === 1 ? "no" : `${cartridgeFactor.toFixed(0)}x`} reduction on its
                own, and your gears{" "}
                {reduction === 1
                  ? "add none on top"
                  : reduction > 1
                    ? `add ${reduction.toFixed(2)}x on top`
                    : `give back ${(1 / reduction).toFixed(2)}x`}
                , so the marker sits at {effectiveReduction.toFixed(2)}x overall.{" "}
              </>
            )}
            These are simplified estimates for learning the tradeoff, real friction and robot weight
            always cost you some of it. Confirm against your own robot before you commit.
          </p>
        </div>
      </div>
    </div>
  );
}
