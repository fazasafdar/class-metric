import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { PUBLIC_PATHS } from "@/lib/pages";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

/** Every route that has a page.tsx under src/app, such as "/" or "/about". */
function pageRoutes(): string[] {
  const appDir = path.join(process.cwd(), "src", "app");
  const files = readdirSync(appDir, { recursive: true }) as string[];
  return files
    .map((file) => file.replace(/\\/g, "/"))
    .filter((file) => file === "page.tsx" || file.endsWith("/page.tsx"))
    .map((file) => "/" + file.replace(/(^|\/)page\.tsx$/, ""));
}

describe("sitemap", () => {
  it("lists exactly the pages that exist, so none is forgotten and none is invented", () => {
    const inSitemap = sitemap().map((entry) => new URL(entry.url).pathname);
    expect([...inSitemap].sort()).toEqual([...pageRoutes()].sort());
  });

  it("uses full addresses on one site, with no duplicates", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(new URL(url).origin).toBe(new URL(SITE_URL).origin);
    }
  });

  it("includes every calculator", () => {
    for (const tool of TOOLS) expect(PUBLIC_PATHS).toContain(tool.href);
    expect(new Set(TOOLS.map((tool) => tool.href)).size).toBe(TOOLS.length);
  });
});

describe("robots", () => {
  it("welcomes search engines and points to the sitemap", () => {
    const result = robots();
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe(absoluteUrl("/sitemap.xml"));
  });
});

describe("absoluteUrl", () => {
  it("never produces a double slash inside the address", () => {
    expect(absoluteUrl("/about")).not.toMatch(/[^:]\/\/about/);
    expect(absoluteUrl("/")).toBe(new URL("/", SITE_URL).toString());
  });
});