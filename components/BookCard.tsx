"use client";

import { memo } from "react";
import { authorLine, type Book } from "@/lib/books";
import { useBookDetail } from "./BookDetailProvider";
import BuyMenu from "./BuyMenu";
import Cover from "./Cover";
import { CoverToggles } from "./SaveButtons";

function BookCard({ book }: { book: Book }) {
  const openDetail = useBookDetail();

  return (
    <article className="flex min-w-0 flex-col">
      <div className="relative">
        {/* Mouse shortcut only; keyboard and screen-reader users open details from the title below. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => openDetail(book)}
          className="block w-full overflow-hidden rounded-md shadow-cover transition-transform duration-200 hover:-translate-y-1"
        >
          <Cover book={book} />
        </button>
        <div className="absolute right-2 top-2">
          <CoverToggles book={book} />
        </div>
      </div>

      <h3 className="mt-3 font-display text-base font-bold leading-snug">
        <button
          type="button"
          onClick={() => openDetail(book)}
          className="line-clamp-2 text-left [overflow-wrap:anywhere] hover:underline"
        >
          {book.title}
        </button>
      </h3>
      <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{authorLine(book)}</p>
      {book.firstPublishYear && <p className="text-xs text-ink-soft">First published {book.firstPublishYear}</p>}

      <BuyMenu book={book} className="mt-3" />
    </article>
  );
}

export default memo(BookCard);
