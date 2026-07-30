import Link from "next/link";

export function LinkCard({
  label,
  href,
  description,
}: {
  label: string;
  href: string;
  description: string;
}) {
  const external = href.startsWith("http");
  const Comp = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Comp
      href={href}
      {...extraProps}
      className="my-5 flex items-center justify-between gap-4 rounded-xl border bg-surface px-4 py-3.5 transition-colors hover:border-purple"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{description}</p>
      </div>
      <span className="shrink-0 text-lg text-[var(--muted)]" aria-hidden>
        {external ? "↗" : "→"}
      </span>
    </Comp>
  );
}
