import { buildSiteUrl, siteConfig } from "@/lib/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"]
      }
    ],
    host: siteConfig.url,
    sitemap: buildSiteUrl("/sitemap.xml")
  };
}
