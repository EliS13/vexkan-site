import { AskTheBook } from "./AskTheBook";

export const metadata = { title: "Ask — Built to Compete" };

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">Ask</h1>

      <div className="mt-8 rounded-xl border p-6" style={{ borderColor: "var(--line)" }}>
        <AskTheBook />
      </div>
    </div>
  );
}
