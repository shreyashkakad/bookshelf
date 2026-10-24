"use client";

import { useMemo } from "react";
import type { Book } from "@/lib/books";
import type { BooksRequest } from "@/lib/books-request";
import { useBooks } from "@/lib/use-books";
import BookGrid, { BookGridSkeleton } from "./BookGrid";
import Container from "./Container";
import { ErrorState } from "./states";

const SHELF_SIZE = 10;

/**
 * `initialBooks` comes from the server render. When that fetch failed (or the
 * catalogue was down at build time) the shelf falls back to loading itself, so
 * a transient outage never leaves the page permanently empty.
 */
export default function TrendingShelf({ initialBooks }: { initialBooks: Book[] | null }) {
  const request = useMemo<BooksRequest | null>(
    () => (initialBooks ? null : { kind: "trending", limit: 20 }),
    [initialBooks],
  );
  const result = useBooks(request);

  const books = initialBooks ?? (result.status === "success" ? result.page.books : null);

  return (
    <section aria-labelledby="trending-heading" className="py-10">
      <Container>
        <h2 id="trending-heading" className="font-display text-3xl font-bold">
          Trending this week
        </h2>
        <p className="mb-6 mt-1 text-ink-soft">What Open Library readers are opening right now.</p>

        {books && books.length > 0 && <BookGrid books={books.slice(0, SHELF_SIZE)} />}
        {books && books.length === 0 && <p className="text-ink-soft">Nothing is trending right now. Try a subject below.</p>}
        {!books && result.status === "loading" && <BookGridSkeleton count={SHELF_SIZE} />}
        {!books && result.status === "error" && <ErrorState kind={result.error.kind} onRetry={result.retry} />}
      </Container>
    </section>
  );
}
