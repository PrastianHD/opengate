import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/dashboard", "/admin", "/api/"],
      },
    ],
    sitemap: "https://opengate.host/sitemap.xml",
  };
}
