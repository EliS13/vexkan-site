import Link from "next/link";
import { GearRatioCalculator } from "./GearRatioCalculator";

export const metadata = { title: "Gear Ratio Calculator — Built From the Ground Up" };

export default function GearRatioPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="eyebrow text-[var(--muted)]">Tool</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
        Gear Ratio & Speed/Torque Calculator
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Ties into{" "}
        <Link href="/guide/chapters/building-the-drivetrain" className="underline">
          Chapter 5, Building the Drivetrain
        </Link>{" "}
        and{" "}
        <Link href="/guide/chapters/advanced-drivetrains" className="underline">
          Chapter 15, Advanced Drivetrains
        </Link>
        . Pick your ratio for the robot&apos;s final weight, then pick your motor count to support
        that ratio, not the other way around.
      </p>

      <div className="mt-8">
        <GearRatioCalculator />
      </div>
    </div>
  );
}
