import type { MetadataRoute } from "next";
import { programSlugs } from "@/content/club/programs";

const BASE = "https://vexkan.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * The results and registration pages are gone: the competition record lives
   * on the home page now, and joining goes through /contact rather than a form.
   */
  const pages = ["", "/about", "/programs", "/community", "/contact", "/guide"];
  const programs = programSlugs().map((slug) => `/programs/${slug}`);

  return [...pages, ...programs].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
}
