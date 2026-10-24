import { normalizeQuery } from "./books-request";

/** Kept out of client components so server routes (the legacy redirect) can use it too. */
export function searchHref(query: string): string {
  const q = normalizeQuery(query);
  return q ? `/search?q=${encodeURIComponent(q)}` : "/search";
}
