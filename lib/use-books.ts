"use client";

import { useCallback, useEffect, useState } from "react";
import type { BooksPage } from "./books";
import type { BooksRequest } from "./books-request";
import { BooksApiError, fetchBooks } from "./client-api";

export type BooksState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; page: BooksPage }
  | { status: "error"; error: BooksApiError };

type Settled = { key: string; state: Exclude<BooksState, { status: "idle" | "loading" }> };

/**
 * Loads books for a request. Passing null keeps the hook idle.
 *
 * "Loading" is derived (no settled result for the current key) rather than
 * stored, so a changed request can never briefly render the previous
 * request's results as if they were current.
 */
export function useBooks(request: BooksRequest | null): BooksState & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);

  const requestKey = request ? JSON.stringify(request) : null;
  const key = requestKey === null ? null : `${requestKey}#${attempt}`;

  useEffect(() => {
    if (requestKey === null || key === null) return;
    const controller = new AbortController();

    // Aborted means a newer request replaced this one, so its outcome (success
    // or failure) must be dropped even if the response was already in flight.
    fetchBooks(JSON.parse(requestKey) as BooksRequest, controller.signal).then(
      (page) => {
        if (!controller.signal.aborted) setSettled({ key, state: { status: "success", page } });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof BooksApiError ? err : new BooksApiError("offline");
        setSettled({ key, state: { status: "error", error } });
      },
    );

    return () => controller.abort();
  }, [requestKey, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (key === null) return { status: "idle", retry };
  if (settled?.key === key) return { ...settled.state, retry };
  return { status: "loading", retry };
}
