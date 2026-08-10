import type { MetadataRoute } from "next";

const base = "https" + "://minenote.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date() },
    { url: base + "/products", lastModified: new Date() },
    { url: base + "/about", lastModified: new Date() },
    { url: base + "/contact", lastModified: new Date() },
  ];
}
