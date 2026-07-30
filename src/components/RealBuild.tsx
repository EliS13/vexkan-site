export function RealBuild({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="my-5 overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--teal)" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ background: "var(--teal-bg)" }}
      >
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: "var(--teal)", color: "white" }}
        >
          Real build
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--teal-text)" }}>
          {title}
        </span>
      </div>
      <div className="bg-surface px-4 py-3">
        <p className="text-[13px] leading-relaxed text-[var(--ink-body)]">{text}</p>
      </div>
    </div>
  );
}
