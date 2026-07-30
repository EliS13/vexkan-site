const KIND_STYLES = {
  visual: {
    label: "Diagram",
    icon: "▦",
    accent: "var(--purple)",
    bg: "var(--purple-bg)",
    text: "var(--purple-text)",
  },
  photo: {
    label: "Photo",
    icon: "◫",
    accent: "var(--teal)",
    bg: "var(--teal-bg)",
    text: "var(--teal-text)",
  },
  video: {
    label: "Video",
    icon: "▶",
    accent: "var(--amber)",
    bg: "var(--amber-bg)",
    text: "var(--amber-text)",
  },
  flag: {
    label: "Draft note",
    icon: "⚑",
    accent: "#a3a3a3",
    bg: "var(--neutral-bg)",
    text: "var(--neutral-text)",
  },
  note: {
    label: "Notebook tip",
    icon: "✎",
    accent: "var(--purple)",
    bg: "var(--purple-bg)",
    text: "var(--purple-text)",
  },
} as const;

export function Callout({ kind, text }: { kind: keyof typeof KIND_STYLES; text: string }) {
  const style = KIND_STYLES[kind];
  return (
    <div
      className="my-5 rounded-xl border bg-surface p-4"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-base"
          style={{ borderColor: style.accent, color: style.accent }}
        >
          <span aria-hidden>{style.icon}</span>
        </div>
        <div className="min-w-0">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            style={{ background: style.bg, color: style.text }}
          >
            {style.label}
            {kind === "photo" || kind === "video" ? " placeholder" : ""}
          </span>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-body)]">{text}</p>
        </div>
      </div>
    </div>
  );
}
