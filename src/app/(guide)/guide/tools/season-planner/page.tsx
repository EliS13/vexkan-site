import { SeasonPlanner } from "./SeasonPlanner";

export const metadata = { title: "Season Planner — Built to Compete" };

export default function SeasonPlannerPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow text-[var(--muted)]">Tool</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">Season Planner</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Competitions, deadlines, and build sessions in one place, with a countdown to the next one.
        Export to your calendar when you want it on everyone&apos;s phone.
      </p>

      <div className="mt-8">
        <SeasonPlanner />
      </div>
    </div>
  );
}
