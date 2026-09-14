import type { MetadataRoute } from "next";
import { projects, site } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/services",
    "/tools",
    "/work",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
  }));

  const work = projects.map((p) => ({
    url: `${site.url}/work/${p.slug}`,
    lastModified: now,
  }));

  const toolRoutes = tools.map((t) => ({
    url: `${site.url}/tools/${t.slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...work, ...toolRoutes];
}
