"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authorLine, type Book } from "@/lib/books";
import { recordViewed } from "@/lib/library-store";
import BuyMenu from "./BuyMenu";
import Cover from "./Cover";
import { CloseIcon, ExternalIcon } from "./icons";
import { LabelledToggles } from "./SaveButtons";

const BookDetailContext = createContext<((book: Book) => void) | null>(null);

export function useBookDetail() {
  const open = useContext(BookDetailContext);
  if (!open) throw new Error("useBookDetail must be used inside BookDetailProvider");
  return open;
}

function Fact({ label, value }: { label: string; value: string | number | null }) {
  if (value === null) return null;
  return (
    <div>
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

// One dialog for the whole app: every card opens the same element, which keeps
// focus handling and scroll locking in a single place.
export function BookDetailProvider({ children }: { children: React.ReactNode }) {
  const [book, setBook] = useState<Book | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback((b: Book) => {
    setBook(b);
    recordViewed(b);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (book && dialog && !dialog.open) dialog.showModal();
  }, [book]);

  const close = () => dialogRef.current?.close();
  const value = useMemo(() => open, [open]);

  return (
    <BookDetailContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="book-detail-title"
        onClose={() => setBook(null)}
        onClick={(e) => {
          // Clicks on the backdrop are dispatched to the dialog element itself.
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto max-h-[92vh] w-[min(46rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border-0 bg-paper p-0 text-ink shadow-pop"
      >
        {book && (
          <div className="relative grid gap-6 p-5 sm:grid-cols-[13rem_1fr] sm:p-8">
            <button
              type="button"
              onClick={close}
              aria-label="Close details"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full hover:bg-line"
            >
              <CloseIcon />
            </button>

            <div className="mx-auto w-40 sm:w-full">
              <Cover book={book} size="L" alt={`Cover of ${book.title}`} className="rounded-md shadow-cover" />
            </div>

            <div className="min-w-0">
              <h2 id="book-detail-title" className="pr-10 font-display text-3xl font-bold leading-tight [overflow-wrap:anywhere]">
                {book.title}
              </h2>
              <p className="mt-1 text-ink-soft">{authorLine(book)}</p>

              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                <Fact label="First published" value={book.firstPublishYear} />
                <Fact label="Pages" value={book.pages} />
                <Fact label="Editions" value={book.editionCount} />
                <Fact label="ISBN" value={book.isbn} />
              </dl>

              {book.subjects.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Subjects">
                  {book.subjects.map((s) => (
                    <li key={s}>
                      <Link
                        href={`/search?subject=${encodeURIComponent(s)}`}
                        onClick={close}
                        className="inline-block rounded-full bg-lilac/60 px-3 py-1 text-xs font-medium hover:bg-lilac"
                      >
                        {s}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex flex-wrap items-start gap-2">
                <LabelledToggles book={book} />
              </div>
              <div className="mt-3 flex flex-wrap items-start gap-2">
                <BuyMenu book={book} className="w-40" />
                {book.readUrl && (
                  <a
                    href={book.readUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-medium hover:bg-paper"
                  >
                    Read free on Internet Archive
                    <ExternalIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </BookDetailContext.Provider>
  );
}
