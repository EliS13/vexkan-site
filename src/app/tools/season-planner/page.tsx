import Link from "next/link";
import { SeasonPlanner } from "./SeasonPlanner";

export const metadata = { title: "Season Planner — Built From the Ground Up" };

export default function SeasonPlannerPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow text-[var(--muted)]">Tool</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">Season Planner</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Competitions, deadlines, and build sessions in one place, with a countdown to the next one.
        Ties into{" "}
        <Link href="/chapters/season-starts-before-you-touch-a-robot" className="underline">
          Chapter 2
        </Link>
        , which is about treating the season as something you plan rather than something that
        happens to you. Export to your calendar when you want it on everyone&apos;s phone.
      </p>

      <div className="mt-8">
        <SeasonPlanner />
      </div>
    </div>
  );
}
