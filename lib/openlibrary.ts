import { looksLikeIsbn, cleanIsbn } from "./isbn";
import { normalizeBooks, type BooksPage } from "./books";
import type { BooksRequest } from "./books-request";

const BASE = "https://openlibrary.org";
const TIMEOUT_MS = 8000;
const USER_AGENT = "Bookshelf/0.1 (personal reading list)";

// Without `fields`, search returns every edition's ISBNs and subjects, which
// is several hundred KB per page.
const FIELDS = [
  "key",
  "title",
  "author_name",
  "cover_i",
  "isbn",
  "first_publish_year",
  "number_of_pages_median",
  "edition_count",
  "subject",
  "ia",
  "ebook_access",
].join(",");

export type UpstreamErrorKind = "timeout" | "network" | "http" | "invalid";

export class UpstreamError extends Error {
  constructor(
    readonly kind: UpstreamErrorKind,
    readonly status?: number,
  ) {
    super(`Open Library request failed: ${kind}${status ? ` (${status})` : ""}`);
    this.name = "UpstreamError";
  }
}

/** Strips Solr operators; a stray ":" or quote makes Open Library parse the query as a field filter. */
export function sanitizeQuery(raw: string): string {
  return raw.replace(/[+\-!(){}[\]^"~*?:\\/|&]/g, " ").replace(/\s+/g, " ").trim();
}

export function buildSearchUrl(
  req: Extract<BooksRequest, { kind: "search" | "subject" }>,
): string | null {
  const p = new URLSearchParams();
  if (req.kind === "subject") {
    const subject = sanitizeQuery(req.subject);
    if (!subject) return null;
    p.set("q", `subject:"${subject}"`);
  } else if (looksLikeIsbn(req.query)) {
    p.set("isbn", cleanIsbn(req.query));
  } else {
    const q = sanitizeQuery(req.query);
    if (!q) return null;
    p.set("q", q);
  }
  p.set("fields", FIELDS);
  p.set("limit", String(req.limit));
  p.set("offset", String(req.offset));
  return `${BASE}/search.json?${p}`;
}

async function getJson(url: string, revalidateSeconds: number): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: revalidateSeconds },
    });
  } catch (err) {
    const name = (err as { name?: unknown } | null)?.name;
    throw new UpstreamError(name === "TimeoutError" || name === "AbortError" ? "timeout" : "network");
  }
  if (!res.ok) throw new UpstreamError("http", res.status);
  try {
    return await res.json();
  } catch {
    throw new UpstreamError("invalid");
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export async function searchBooks(
  req: Extract<BooksRequest, { kind: "search" | "subject" }>,
): Promise<BooksPage> {
  const url = buildSearchUrl(req);
  // Nothing searchable left after sanitising (e.g. "???"): that is "no matches", not an error.
  if (!url) return { books: [], total: 0, offset: req.offset };

  const json = await getJson(url, 300);
  if (!isRecord(json) || !Array.isArray(json.docs)) throw new UpstreamError("invalid");

  const books = normalizeBooks(json.docs);
  const total =
    typeof json.numFound === "number" && json.numFound >= 0 ? json.numFound : books.length;
  return { books, total, offset: req.offset };
}

export async function fetchTrending(limit: number): Promise<BooksPage> {
  const json = await getJson(`${BASE}/trending/weekly.json?limit=${limit}`, 3600);
  if (!isRecord(json) || !Array.isArray(json.works)) throw new UpstreamError("invalid");
  const books = normalizeBooks(json.works);
  return { books, total: books.length, offset: 0 };
}

export function fetchBooksPage(req: BooksRequest): Promise<BooksPage> {
  return req.kind === "trending" ? fetchTrending(req.limit) : searchBooks(req);
}
