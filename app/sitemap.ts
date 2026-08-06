import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://auracraft.com",
      lastModified: new Date(),
    },
    {
      url: "https://auracraft.com/products",
      lastModified: new Date(),
    },
    {
      url: "https://auracraft.com/about",
      lastModified: new Date(),
    },
    {
      url: "https://auracraft.com/contact",
      lastModified: new Date(),
    },
  ];
}