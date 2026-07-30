export type Program = "IQ" | "V5";

export interface Cartridge {
  id: string;
  label: string;
  rpm: number;
  /** Stall torque at the motor output shaft, in newton-metres. */
  stallTorque: number;
}

/**
 * Published VEX figures. The 11W motor's torque changes with its cartridge
 * because the cartridge changes the internal gearing. The 5.5W motor has a
 * fixed internal ratio and takes no cartridges.
 */
export const V5_CARTRIDGES: Cartridge[] = [
  { id: "red", label: "100 RPM (red)", rpm: 100, stallTorque: 2.1 },
  { id: "green", label: "200 RPM (green)", rpm: 200, stallTorque: 1.05 },
  { id: "blue", label: "600 RPM (blue)", rpm: 600, stallTorque: 0.35 },
];

export const V5_MOTOR_5W = { watts: 5.5, rpm: 200, stallTorque: 0.5 };
export const V5_MOTOR_11W_WATTS = 11;

export const IQ_MOTOR = { watts: 1.4, rpm: 120, stallTorque: 0.414 };

/**
 * V5RC Override (2026-27) caps drivetrain motor power at 55W. Always confirm
 * against the current game manual, these limits change season to season.
 */
export const V5_DRIVETRAIN_WATT_CAP = 55;

/** Tooth counts VEX actually sells, so every ratio here is one you can build. */
export const IQ_GEAR_TEETH = [12, 24, 36, 48, 60];
// The basic Gear Kit is 12/36/60/84, but High Strength adds 24T, 48T and 72T.
export const V5_GEAR_TEETH = [12, 24, 36, 48, 60, 72, 84];


/* ---------------- Traction ---------------- */

/**
 * Approximate coefficients of friction on VEX foam tiles. A team's measured
 * numbers put a 4in omni around 0.81 and a plain 4in traction tire around 0.93,
 * so omni wheels really do give up pushing grip. Treat these as ballpark, they
 * shift with tile wear, wheel age, and how clean everything is.
 */
export const MU_OMNI = 0.8;
export const MU_TRACTION = 0.95;

export interface WheelSize {
  id: string;
  label: string;
  /** IQ wheels are sold by travel per revolution, V5 by diameter. */
  travelMm?: number;
  diameterInches?: number;
  note?: string;
}

export const IQ_WHEEL_SIZES: WheelSize[] = [
  { id: "iq-100", label: "100 mm travel", travelMm: 100, note: "A 100 mm tire on a 20 mm pulley. Small and low-profile." },
  { id: "iq-160", label: "160 mm travel", travelMm: 160 },
  { id: "iq-200", label: "200 mm travel", travelMm: 200, note: "The most common IQ drive wheel, and the size the IQ omni comes in." },
  { id: "iq-250", label: "250 mm travel", travelMm: 250 },
];

export const V5_WHEEL_SIZES: WheelSize[] = [
  { id: "v5-275", label: '2.75 in', diameterInches: 2.75 },
  { id: "v5-325", label: '3.25 in', diameterInches: 3.25 },
  { id: "v5-4", label: '4 in', diameterInches: 4 },
];

/** Radius in metres, whichever way the wheel is described. */
export function wheelRadiusMetres(size: WheelSize): number {
  if (size.travelMm) return size.travelMm / 1000 / (2 * Math.PI);
  return ((size.diameterInches ?? 0) * 0.0254) / 2;
}

export const LBF_PER_NEWTON = 0.224809;
export const NEWTON_PER_LB = 4.44822;
