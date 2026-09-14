import type { MetadataRoute } from "next";
import { projects, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/services", "/work", "/about", "/contact", "/privacy", "/terms"].map(
    (path) => ({
      url: `${site.url}${path}`,
      lastModified: now,
    }),
  );

  const work = projects.map((p) => ({
    url: `${site.url}/work/${p.slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...work];
}
