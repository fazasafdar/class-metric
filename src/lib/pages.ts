import { TOOLS } from "./tools";

/** Every public page on the site. The sitemap is built from this list. */
export const PUBLIC_PATHS = ["/", ...TOOLS.map((tool) => tool.href), "/about", "/privacy"];