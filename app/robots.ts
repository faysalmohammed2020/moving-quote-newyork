import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "https://movingquotenewyork.com/";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/auth/",
          "/login/",
          "/register/",
          "/api/",
          "/_next/",
          "/private/",
        ],
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: "https://movingquotenewyork.com/",
  };
}
