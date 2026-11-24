import { GearRatioCalculator } from "./GearRatioCalculator";

export const metadata = { title: "Gear Ratio Calculator — Built to Compete" };

export default function GearRatioPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        Gear Ratio & Speed/Torque Calculator
      </h1>

      <div className="mt-8">
        <GearRatioCalculator />
      </div>
    </div>
  );
}
