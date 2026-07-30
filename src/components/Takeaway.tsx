export function Takeaway({ text }: { text: string }) {
  return (
    <div
      className="my-6 rounded-xl border-l-4 bg-[var(--foreground)] px-5 py-4"
      style={{ borderColor: "var(--amber)" }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--amber-on-dark)" }}
      >
        One-line takeaway
      </p>
      <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-white">{text}</p>
    </div>
  );
}
