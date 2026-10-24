export const PAGE_SIZE = 24;
const MAX_LIMIT = 48;
const MAX_OFFSET = 9999;
const MAX_TEXT = 200;

export type BooksRequest =
  | { kind: "search"; query: string; offset: number; limit: number }
  | { kind: "subject"; subject: string; offset: number; limit: number }
  | { kind: "trending"; limit: number };

export function normalizeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function requestToParams(req: BooksRequest): URLSearchParams {
  const p = new URLSearchParams({ kind: req.kind, limit: String(req.limit) });
  if (req.kind === "search") {
    p.set("q", req.query);
    p.set("offset", String(req.offset));
  } else if (req.kind === "subject") {
    p.set("subject", req.subject);
    p.set("offset", String(req.offset));
  }
  return p;
}

function intParam(value: string | null, fallback: number, min: number, max: number): number | null {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n >= min && n <= max ? n : null;
}

/** Validates untrusted query-string input for the /api/books route. */
export function parseBooksParams(sp: URLSearchParams): BooksRequest | null {
  const limit = intParam(sp.get("limit"), PAGE_SIZE, 1, MAX_LIMIT);
  const offset = intParam(sp.get("offset"), 0, 0, MAX_OFFSET);
  if (limit === null || offset === null) return null;

  const kind = sp.get("kind");
  if (kind === "trending") return { kind, limit };

  const value = normalizeQuery(sp.get(kind === "subject" ? "subject" : "q") ?? "");
  if (!value || value.length > MAX_TEXT) return null;

  if (kind === "search") return { kind, query: value, offset, limit };
  if (kind === "subject") return { kind, subject: value, offset, limit };
  return null;
}
