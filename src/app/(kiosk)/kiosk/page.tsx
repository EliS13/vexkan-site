/**
 * Placeholder. The routing and the layout are real; the grid is not built yet,
 * because the schema and the sign-in flow are still in design. Replaced in
 * phase 2 by the roster grid backed by the sessions table.
 */
export default function KioskPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-8 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ffb100]">
        signin.vexkan.ca
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Sign in / sign out
      </h1>
      <p className="max-w-prose text-[#9aa4ae]">
        The subdomain routing and the kiosk layout are wired up. The roster grid
        lands in phase 2, once the schema and the sign-in flow are agreed.
      </p>
      <ul className="max-w-prose space-y-2 border-t border-[#2e343b] pt-6 font-mono text-sm text-[#9aa4ae]">
        <li>
          <span className="text-[#35c17a]">done</span> — host rewrite, kiosk route group, kiosk layout
        </li>
        <li>
          <span className="text-[#9aa4ae]">next</span> — members and sessions tables, seed script
        </li>
        <li>
          <span className="text-[#9aa4ae]">next</span> — tile grid, one-tap toggle, confirmation
        </li>
      </ul>
      <p className="max-w-prose border-t border-[#2e343b] pt-6 text-sm text-[#9aa4ae]">
        The club site is unchanged and still served at{" "}
        <code className="text-[#e8eaed]">127.0.0.1:3000</code> while this dev
        rewrite is on.
      </p>
    </div>
  );
}
