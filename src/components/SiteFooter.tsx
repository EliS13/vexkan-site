export function SiteFooter() {
  return (
    <footer className="border-t bg-surface" style={{ borderColor: "var(--line)" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 text-[13px] leading-relaxed text-muted">
        <p>
          Built From the Ground Up is written from the field by team 16688A / VexKan Robotics.
          This site is a companion to the book, not a replacement for the official{" "}
          <a href="https://www.vexrobotics.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--ink-body)]">
            VEX Robotics
          </a>{" "}
          game manual for your season.
        </p>
      </div>
    </footer>
  );
}
