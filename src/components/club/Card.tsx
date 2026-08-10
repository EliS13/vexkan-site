export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  /*
   * Cards rest slightly off the page by default. Callers that are genuinely
   * interactive add `lift-hover` to get the raised state on hover; a card that
   * lifts without being clickable is a lie about what it does.
   */
  return (
    <div
      className={`lift rounded-2xl p-6 ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {children}
    </div>
  );
}
