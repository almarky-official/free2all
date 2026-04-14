import { buildSiteUrl, tools } from "@/lib/site";

export default function sitemap() {
  const staticRoutes = ["", "/about", "/privacy-policy", "/tools"];

  return [
    ...staticRoutes.map((route, index) => ({
      url: buildSiteUrl(route || "/"),
      lastModified: new Date(),
      changeFrequency: index === 0 ? "daily" : "weekly",
      priority: index === 0 ? 1 : 0.8
    })),
    ...tools.map((tool) => ({
      url: buildSiteUrl(`/tools/${tool.slug}`),
      lastModified: new Date(),
      changeFrequency: tool.trending ? "weekly" : "monthly",
      priority: tool.category === "Media" ? 0.9 : 0.7
    }))
  ];
}
