"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeQuery, PAGE_SIZE, type BooksRequest } from "@/lib/books-request";
import { useBooks } from "@/lib/use-books";
import BookGrid, { BookGridSkeleton } from "./BookGrid";
import Container from "./Container";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, SearchIcon } from "./icons";
import { EmptyState, ErrorState, LinkButton } from "./states";
import SubjectTiles from "./SubjectTiles";

function pageHref(params: { q: string; subject: string }, page: number): string {
  const p = new URLSearchParams();
  if (params.subject) p.set("subject", params.subject);
  else if (params.q) p.set("q", params.q);
  if (page > 1) p.set("page", String(page));
  return `/search?${p}`;
}

export default function SearchResults() {
  const sp = useSearchParams();
  const q = normalizeQuery(sp.get("q") ?? "");
  const subject = normalizeQuery(sp.get("subject") ?? "");
  const rawPage = Number(sp.get("page"));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

  const request = useMemo<BooksRequest | null>(() => {
    if (subject) return { kind: "subject", subject, offset, limit: PAGE_SIZE };
    if (q) return { kind: "search", query: q, offset, limit: PAGE_SIZE };
    return null;
  }, [q, subject, offset]);

  const result = useBooks(request);

  // A new page of results should start at the top, not wherever the pager button was.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  if (!request) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={<SearchIcon className="h-9 w-9" />}
          title="What are you looking for?"
          message="Type a title, an author or an ISBN above, or start from a subject."
        />
        <SubjectTiles />
      </Container>
    );
  }

  const heading = subject ? subject : `“${q}”`;
  const totalPages = result.status === "success" ? Math.ceil(result.page.total / PAGE_SIZE) : 0;

  return (
    <Container className="py-8">
      <h1 className="font-display text-3xl font-bold [overflow-wrap:anywhere] sm:text-4xl">
        {subject ? `Subject: ${heading}` : `Results for ${heading}`}
      </h1>
      <p role="status" className="mb-8 mt-1 min-h-6 text-ink-soft">
        {result.status === "success" &&
          result.page.total > 0 &&
          `Showing ${offset + 1}–${offset + result.page.books.length} of ${result.page.total.toLocaleString("en-IN")} books`}
        {result.status === "success" && result.page.total === 0 && "No books found"}
      </p>

      {result.status === "loading" && <BookGridSkeleton count={10} />}

      {result.status === "error" && <ErrorState kind={result.error.kind} onRetry={result.retry} />}

      {result.status === "success" && result.page.books.length === 0 && (
        <EmptyState
          icon={<BookOpenIcon className="h-9 w-9" />}
          title={page > 1 ? "That page is empty" : `Nothing matches ${heading}`}
          message={
            page > 1
              ? "There are no more results past this point."
              : "Check the spelling, or try a shorter title or just the author’s surname."
          }
        >
          <LinkButton href={page > 1 ? pageHref({ q, subject }, 1) : "/search"}>
            {page > 1 ? "Back to first page" : "Clear search"}
          </LinkButton>
          <LinkButton href="/" variant="secondary">
            Explore the home page
          </LinkButton>
        </EmptyState>
      )}

      {result.status === "success" && result.page.books.length > 0 && (
        <>
          <BookGrid books={result.page.books} />
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-4">
            {page > 1 ? (
              <Link
                href={pageHref({ q, subject }, page - 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 font-medium hover:bg-paper"
              >
                <ArrowLeftIcon className="h-4 w-4" /> Previous
              </Link>
            ) : (
              <span className="min-w-28" />
            )}
            <span className="text-sm text-ink-soft">
              Page {page} of {totalPages.toLocaleString("en-IN")}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref({ q, subject }, page + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 font-medium hover:bg-paper"
              >
                Next <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <span className="min-w-28" />
            )}
          </nav>
        </>
      )}
    </Container>
  );
}
