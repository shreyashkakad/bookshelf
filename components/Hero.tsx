"use client";

import Link from "next/link";
import { Suspense } from "react";
import type { Book } from "@/lib/books";
import { authorLine } from "@/lib/books";
import { useLibraryState } from "@/lib/use-library";
import { useBookDetail } from "./BookDetailProvider";
import Container from "./Container";
import Cover from "./Cover";
import { BookmarkIcon, HeartIcon } from "./icons";
import SearchBar from "./SearchBar";

const FAN = [
  "left-0 top-10 -rotate-6 z-0",
  "left-1/2 top-0 -translate-x-1/2 z-10",
  "right-0 top-10 rotate-6 z-0",
];

function QuickLinks() {
  const { favorites, wishlist } = useLibraryState();
  const pill =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium hover:bg-paper";
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link href="/favorites" className={pill}>
        <HeartIcon className="h-4 w-4 text-berry" />
        Favorites
        <span className="text-ink-soft">{favorites.length}</span>
      </Link>
      <Link href="/wishlist" className={pill}>
        <BookmarkIcon className="h-4 w-4 text-azure" />
        Wishlist
        <span className="text-ink-soft">{wishlist.length}</span>
      </Link>
    </div>
  );
}

function BookFan({ books }: { books: Book[] }) {
  const openDetail = useBookDetail();
  return (
    <div className="relative mx-auto h-[19rem] w-full max-w-sm sm:h-[24rem]">
      {books.map((book, i) => (
        <button
          key={book.id}
          type="button"
          onClick={() => openDetail(book)}
          aria-label={`View details for ${book.title} by ${authorLine(book)}`}
          className={`absolute w-[44%] overflow-hidden rounded-md shadow-cover transition-transform duration-200 hover:z-20 hover:scale-105 ${FAN[i]}`}
        >
          <Cover book={book} size="L" />
        </button>
      ))}
    </div>
  );
}

export default function Hero({ featured }: { featured: Book[] }) {
  // Only real covers go in the fan; a placeholder tile would read as a fake book.
  const covered = featured.filter((b) => b.coverId !== null).slice(0, 3);
  const showFan = covered.length === 3;

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-[58%_42%_55%_45%/48%_52%_48%_52%] bg-mint/70" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-[45%_55%_40%_60%/55%_45%_55%_45%] bg-lilac/60" />
        <div className="absolute -bottom-16 right-1/4 h-44 w-44 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-peach/60" />
      </div>

      <Container className={`relative grid items-center gap-10 py-14 md:py-20 ${showFan ? "md:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        <div className={showFan ? "" : "mx-auto max-w-2xl text-center"}>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            Find books worth remembering.
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            Search by title, author or ISBN. Keep what you love, and line up what to read next.
          </p>
          <div className="mt-7 max-w-xl">
            <Suspense fallback={<div className="skeleton h-[3.75rem] rounded-full" />}>
              <SearchBar size="lg" />
            </Suspense>
          </div>
          <QuickLinks />
        </div>

        {showFan && (
          <div>
            <BookFan books={covered} />
            <p className="mt-2 text-center text-sm text-ink-soft">Trending on Open Library this week</p>
          </div>
        )}
      </Container>
    </section>
  );
}
