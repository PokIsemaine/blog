import { searchIndex } from "@/lib/search-index";
// Build-time JSON export only. GitHub Pages serves this as a static file.
export const dynamic = "force-static";
export const GET = searchIndex.staticGET;
