import { SeasonPlanner } from "./SeasonPlanner";

export const metadata = { title: "Season Planner — Built to Compete" };

export default function SeasonPlannerPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">Season Planner</h1>

      <div className="mt-8">
        <SeasonPlanner />
      </div>
    </div>
  );
}
