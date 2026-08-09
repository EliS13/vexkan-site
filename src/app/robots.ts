import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* Guardian contact details are behind /admin. */
      disallow: "/admin",
    },
    sitemap: "https://vexkan.ca/sitemap.xml",
  };
}
