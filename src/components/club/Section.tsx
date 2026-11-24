type Props = {
  children?: React.ReactNode;
  title?: string;
  tone?: "default" | "surface";
  id?: string;
  titleAs?: "h1" | "h2";
};

/** One vertical band of a club page, with optional heading block. */
export function Section({
  children,
  title,
  tone = "default",
  id,
  titleAs = "h2",
}: Props) {
  const TitleTag = titleAs;

  return (
    <section
      id={id}
      className="py-16 sm:py-20"
      style={tone === "surface" ? { background: "var(--surface)" } : undefined}
    >
      <div className="mx-auto max-w-6xl px-5">
        {title && (
          <div className="mb-10 max-w-2xl">
            <TitleTag className="text-3xl font-semibold sm:text-4xl">{title}</TitleTag>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
