import type { MetadataRoute } from "next";
import { PUBLIC_PATHS } from "@/lib/pages";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: absoluteUrl(path) }));
}