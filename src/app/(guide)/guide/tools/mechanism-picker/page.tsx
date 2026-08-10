import Link from "next/link";
import { MechanismPicker } from "./MechanismPicker";

export const metadata = { title: "Mechanism Picker — Built From the Ground Up" };

export default function MechanismPickerPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="eyebrow text-[var(--muted)]">Tool</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
        Intake & Outtake Picker
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        A shortlist to prototype, not a single answer. Ties into{" "}
        <Link href="/guide/chapters/intakes" className="underline">
          Chapter 6
        </Link>
        ,{" "}
        <Link href="/guide/chapters/outtake-and-scoring" className="underline">
          Chapter 7
        </Link>
        , and{" "}
        <Link href="/guide/chapters/combining-mechanisms" className="underline">
          Chapter 8
        </Link>
        .
      </p>

      <div
        className="mt-6 max-w-2xl rounded-xl border p-4"
        style={{ borderColor: "var(--line)", background: "var(--teal-bg)" }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--teal-text)" }}>
          The job picks the mechanism, not the shape
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-body)]">
          It is tempting to sort intakes by what the game element looks like, but rollers handle odd
          shapes far better than people expect. 16688A ran roller intakes on donut-shaped rings one
          season and on pins the next. What actually decides the mechanism is the job you need done
          and how much the element has to travel inside the robot.
        </p>
      </div>

      <div className="mt-8">
        <MechanismPicker />
      </div>
    </div>
  );
}
