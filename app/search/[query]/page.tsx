import { redirect } from "next/navigation";
import { searchHref } from "@/lib/search-href";

// Old links looked like /search/dune; results now live at /search?q=dune.
export default async function LegacySearchRoute({ params }: { params: Promise<{ query: string }> }) {
  const { query } = await params;
  let decoded = query;
  try {
    decoded = decodeURIComponent(query);
  } catch {
    // Malformed escape sequence: use the raw segment.
  }
  redirect(searchHref(decoded));
}
