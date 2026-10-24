"use client";

import { useState } from "react";
import { authorLine, coverUrl, type Book, type CoverSize } from "@/lib/books";

const TINTS = ["bg-mint", "bg-butter", "bg-peach", "bg-lilac"];

function CoverPlaceholder({ book }: { book: Book }) {
  let hash = 0;
  for (const ch of book.title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden p-4 pl-6 text-ink ${TINTS[hash % TINTS.length]}`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-3 bg-ink/15" />
      <span aria-hidden="true" className="absolute inset-2 left-5 rounded-sm border border-ink/25" />
      <p className="relative line-clamp-5 font-display text-lg font-bold leading-tight sm:text-xl">{book.title}</p>
      <p className="relative line-clamp-2 text-xs font-medium">{authorLine(book)}</p>
    </div>
  );
}

export default function Cover({
  book,
  size = "M",
  alt = "",
  className = "",
}: {
  book: Book;
  size?: CoverSize;
  /** Cards pass "" because the title is printed right beside the cover. */
  alt?: string;
  className?: string;
}) {
  // Remember which cover failed, not just that one did, so a reused component
  // showing a different book still tries that book's cover.
  const [failedId, setFailedId] = useState<number | null>(null);
  const showImage = book.coverId !== null && failedId !== book.coverId;

  return (
    <div className={`aspect-[2/3] w-full overflow-hidden bg-line ${className}`}>
      {showImage ? (
        // Covers are already sized by Open Library's CDN, so next/image's optimizer adds nothing here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl(book.coverId as number, size)}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedId(book.coverId)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth <= 1) setFailedId(book.coverId);
          }}
          className="h-full w-full object-cover"
        />
      ) : (
        <CoverPlaceholder book={book} />
      )}
    </div>
  );
}
