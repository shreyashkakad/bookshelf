"use client";

import type { Book } from "@/lib/books";
import { useBookActions } from "@/lib/use-library";
import { BookmarkIcon, HeartIcon } from "./icons";

/** Round icon toggles that sit on top of a cover. */
export function CoverToggles({ book }: { book: Book }) {
  const { favorite, wishlist, toggleFavorite, toggleWishlist } = useBookActions(book);
  const base =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md transition-colors hover:bg-white";
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-pressed={favorite}
        aria-label={`Favorite “${book.title}”`}
        onClick={toggleFavorite}
        className={`${base} ${favorite ? "text-berry" : "text-ink-soft"}`}
      >
        <HeartIcon filled={favorite} />
      </button>
      <button
        type="button"
        aria-pressed={wishlist}
        aria-label={`Add “${book.title}” to wishlist`}
        onClick={toggleWishlist}
        className={`${base} ${wishlist ? "text-azure" : "text-ink-soft"}`}
      >
        <BookmarkIcon filled={wishlist} />
      </button>
    </div>
  );
}

/** Labelled versions for the detail dialog, where there is room for words. */
export function LabelledToggles({ book }: { book: Book }) {
  const { favorite, wishlist, toggleFavorite, toggleWishlist } = useBookActions(book);
  const base =
    "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors";
  return (
    <>
      <button
        type="button"
        aria-pressed={favorite}
        onClick={toggleFavorite}
        className={`${base} ${favorite ? "border-berry bg-berry/10 text-berry" : "border-line bg-white hover:bg-paper"}`}
      >
        <HeartIcon filled={favorite} className="h-4 w-4" />
        {favorite ? "Favorited" : "Favorite"}
      </button>
      <button
        type="button"
        aria-pressed={wishlist}
        onClick={toggleWishlist}
        className={`${base} ${wishlist ? "border-azure bg-azure/10 text-azure" : "border-line bg-white hover:bg-paper"}`}
      >
        <BookmarkIcon filled={wishlist} className="h-4 w-4" />
        {wishlist ? "On wishlist" : "Wishlist"}
      </button>
    </>
  );
}
