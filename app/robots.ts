import type { MetadataRoute } from "next";
import { apexUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/blog/search"],
      },
    ],
    sitemap: apexUrl("/sitemap.xml"),
    host: apexUrl("/"),
  };
}
