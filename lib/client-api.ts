import type { BooksPage } from "./books";
import { requestToParams, type BooksRequest } from "./books-request";

export type BooksApiErrorKind = "offline" | "timeout" | "server" | "invalid";

export class BooksApiError extends Error {
  constructor(readonly kind: BooksApiErrorKind) {
    super(`Books request failed: ${kind}`);
    this.name = "BooksApiError";
  }
}

const CLIENT_TIMEOUT_MS = 15000;

function isBooksPage(v: unknown): v is BooksPage {
  if (typeof v !== "object" || v === null) return false;
  const page = v as Partial<BooksPage>;
  return Array.isArray(page.books) && typeof page.total === "number" && typeof page.offset === "number";
}

/**
 * Rejects with a native AbortError when the caller's signal fires, so callers
 * can tell "superseded by a newer request" apart from a real failure.
 */
export async function fetchBooks(req: BooksRequest, signal?: AbortSignal): Promise<BooksPage> {
  const timeout = AbortSignal.timeout(CLIENT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`/api/books?${requestToParams(req)}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new BooksApiError(timeout.aborted ? "timeout" : "offline");
  }

  if (!res.ok) throw new BooksApiError(res.status === 504 ? "timeout" : "server");

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new BooksApiError("invalid");
  }
  if (!isBooksPage(json)) throw new BooksApiError("invalid");
  return json;
}
