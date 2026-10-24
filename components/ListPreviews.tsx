"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { BooksRequest } from "@/lib/books-request";
import { useBooks } from "@/lib/use-books";
import Container from "./Container";
import Cover from "./Cover";

const LISTS = ["Fantasy", "Mystery", "Philosophy"];

function ListPreview({ subject }: { subject: string }) {
  const request = useMemo<BooksRequest>(() => ({ kind: "subject", subject, offset: 0, limit: 8 }), [subject]);
  const result = useBooks(request);

  const books = result.status === "success" ? result.page.books.filter((b) => b.coverId !== null).slice(0, 4) : [];

  return (
    <div>
      {result.status === "error" ? (
        <div className="flex aspect-[8/3] flex-col items-center justify-center gap-2 rounded-md bg-line/60 text-sm">
          <p className="text-ink-soft">Couldn’t load this list.</p>
          <button type="button" onClick={result.retry} className="min-h-10 rounded-md px-3 font-medium text-azure underline">
            Try again
          </button>
        </div>
      ) : (
        <Link href={`/search?subject=${encodeURIComponent(subject)}`} className="block" aria-label={`Browse ${subject} books`}>
          <div className="grid grid-cols-4 gap-2" aria-hidden="true">
            {result.status === "loading" || books.length === 0
              ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton aspect-[2/3] rounded-sm" />)
              : books.map((b) => <Cover key={b.id} book={b} size="S" className="rounded-sm shadow-cover" />)}
          </div>
        </Link>
      )}
      <h3 className="mt-4 font-display text-xl font-bold">{subject}</h3>
      <Link href={`/search?subject=${encodeURIComponent(subject)}`} className="text-sm text-azure underline underline-offset-2">
        See all {subject.toLowerCase()} books
      </Link>
    </div>
  );
}

export default function ListPreviews() {
  return (
    <section aria-labelledby="lists-heading" className="py-10">
      <Container>
        <h2 id="lists-heading" className="mb-6 font-display text-3xl font-bold">
          Shelves to browse
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {LISTS.map((s) => (
            <ListPreview key={s} subject={s} />
          ))}
        </div>
      </Container>
    </section>
  );
}
