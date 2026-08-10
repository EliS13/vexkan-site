import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/*
 * Only pure logic is tested here: content invariants, form validation, CSV.
 * Pages are verified by `npm run build` and in the browser, which is cheaper
 * than maintaining a React renderer for a site that is almost entirely static.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
