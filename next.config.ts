import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Every page here is prerendered and there are no API routes, so this also
   * builds as a plain static folder if you ever want to host it somewhere
   * without a Next.js runtime. To do that, add:
   *
   *   output: "export",
   *   images: { unoptimized: true },
   *
   * and `npm run build` writes the whole site to ./out
   */
};

export default nextConfig;
