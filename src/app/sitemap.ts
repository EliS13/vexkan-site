import type { MetadataRoute } from "next";
import { programSlugs } from "@/content/club/programs";

const BASE = "https://vexkan.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/programs", "/events", "/register", "/contact", "/guide"];
  const programs = programSlugs().map((slug) => `/programs/${slug}`);

  return [...pages, ...programs].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
}
