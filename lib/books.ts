import { pickBestIsbn } from "./isbn";

export interface Book {
  /** Open Library work id, e.g. "OL45883W". Stable across searches. */
  id: string;
  title: string;
  authors: string[];
  coverId: number | null;
  isbn: string | null;
  firstPublishYear: number | null;
  pages: number | null;
  editionCount: number | null;
  subjects: string[];
  /** Only set for public-domain scans we can legitimately link to. */
  readUrl: string | null;
}

export interface BooksPage {
  books: Book[];
  total: number;
  offset: number;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const text = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

const positiveInt = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : null;

const textList = (v: unknown, max = Infinity): string[] =>
  Array.isArray(v)
    ? v.map(text).filter((s): s is string => s !== null).slice(0, max)
    : [];

const ARCHIVE_PREFIX = "https://archive.org/details/";

/** Maps one Open Library search/trending doc to a Book, or null if unusable. */
export function normalizeBook(raw: unknown): Book | null {
  if (!isRecord(raw)) return null;

  const isbn = pickBestIsbn(raw.isbn);
  const key = text(raw.key);
  const id = key ? key.replace(/^\/(works|books)\//, "") : isbn ? `isbn-${isbn}` : null;
  if (!id) return null;

  const ia = textList(raw.ia)[0];
  const readUrl =
    ia && raw.ebook_access === "public"
      ? `${ARCHIVE_PREFIX}${encodeURIComponent(ia)}`
      : null;

  return {
    id,
    title: text(raw.title) ?? "Untitled",
    authors: textList(raw.author_name),
    coverId: positiveInt(raw.cover_i),
    isbn,
    firstPublishYear: positiveInt(raw.first_publish_year),
    pages: positiveInt(raw.number_of_pages_median),
    editionCount: positiveInt(raw.edition_count),
    subjects: textList(raw.subject, 6),
    readUrl,
  };
}

export function normalizeBooks(rawList: unknown): Book[] {
  if (!Array.isArray(rawList)) return [];
  const seen = new Set<string>();
  const books: Book[] = [];
  for (const raw of rawList) {
    const book = normalizeBook(raw);
    // Trending feeds can repeat a work; duplicate React keys would break the grid.
    if (book && !seen.has(book.id)) {
      seen.add(book.id);
      books.push(book);
    }
  }
  return books;
}

/**
 * Revalidates a book read back from localStorage. Stored data can be stale,
 * hand-edited or from an older schema, so nothing is trusted — in particular
 * readUrl, which ends up in an href.
 */
export function sanitizeBook(raw: unknown): Book | null {
  if (!isRecord(raw)) return null;
  const id = text(raw.id);
  if (!id) return null;
  const readUrl = text(raw.readUrl);
  return {
    id,
    title: text(raw.title) ?? "Untitled",
    authors: textList(raw.authors),
    coverId: positiveInt(raw.coverId),
    isbn: pickBestIsbn([raw.isbn]),
    firstPublishYear: positiveInt(raw.firstPublishYear),
    pages: positiveInt(raw.pages),
    editionCount: positiveInt(raw.editionCount),
    subjects: textList(raw.subjects, 6),
    readUrl: readUrl && readUrl.startsWith(ARCHIVE_PREFIX) ? readUrl : null,
  };
}

export function authorLine(book: Book): string {
  if (book.authors.length === 0) return "Unknown author";
  const [first, second, ...rest] = book.authors;
  if (!second) return first;
  return rest.length > 0 ? `${first}, ${second} +${rest.length}` : `${first}, ${second}`;
}

export type CoverSize = "S" | "M" | "L";

/** `default=false` makes Open Library 404 for missing covers instead of a 1px gif. */
export function coverUrl(coverId: number, size: CoverSize): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`;
}
