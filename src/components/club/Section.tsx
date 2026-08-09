type Props = {
  children?: React.ReactNode;
  eyebrow?: string;
  title?: string;
  lead?: string;
  tone?: "default" | "surface";
  id?: string;
};

/** One vertical band of a club page, with optional heading block. */
export function Section({ children, eyebrow, title, lead, tone = "default", id }: Props) {
  return (
    <section
      id={id}
      className="py-16 sm:py-20"
      style={tone === "surface" ? { background: "var(--surface)" } : undefined}
    >
      <div className="mx-auto max-w-6xl px-5">
        {(eyebrow || title || lead) && (
          <div className="mb-10 max-w-2xl">
            {eyebrow && <p className="eyebrow text-[var(--muted)]">{eyebrow}</p>}
            {title && <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>}
            {lead && <p className="club-lead mt-4">{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
