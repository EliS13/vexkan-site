import Link from "next/link";
import { tools } from "@/content/tools";

export const metadata = { title: "Tools — Built to Compete" };

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-3xl font-semibold text-foreground">Interactive Tools</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {tools.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="rounded-xl border bg-surface p-5 transition-colors hover:border-[#cdc6bf]"
              style={{ borderColor: "var(--line)" }}
            >
              <h2 className="font-serif text-lg font-semibold text-foreground">{t.title}</h2>
            </Link>
        ))}
      </div>
    </div>
  );
}
