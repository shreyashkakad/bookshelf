import type { Book } from "@/lib/books";
import BookCard from "./BookCard";

export const GRID_CLASS = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5";

export default function BookGrid({ books }: { books: Book[] }) {
  return (
    <ul className={GRID_CLASS}>
      {books.map((book) => (
        <li key={book.id} className="min-w-0">
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}

/** Same grid and aspect ratios as real cards, so content swaps in without a layout jump. */
export function BookGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3] w-full rounded-md" />
          <div className="skeleton mt-3 h-4 w-4/5 rounded" />
          <div className="skeleton mt-2 h-3.5 w-1/2 rounded" />
          <div className="skeleton mt-4 h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
