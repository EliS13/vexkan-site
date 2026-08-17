import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    /*
     * Last, so it wins: flat config resolves later entries over earlier ones.
     *
     * The kiosk is served at signin.vexkan.ca through a host rewrite, and
     * next/link navigates client-side without applying rewrites — a
     * <Link href="/"> there resolves against the club site's route tree and the
     * button does nothing at all. Plain anchors force a full navigation so the
     * server rewrites the path. This rule would push them back to the broken
     * form, and only inside the kiosk is that the wrong advice.
     */
    files: ["src/app/(kiosk)/**/*.tsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
]);

export default eslintConfig;
