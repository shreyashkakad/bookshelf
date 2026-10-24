"use client";

import { useHydrated, useLibraryState } from "@/lib/use-library";
import type { CollectionName } from "@/lib/library-store";
import BookGrid, { BookGridSkeleton } from "./BookGrid";
import Container from "./Container";
import { BookmarkIcon, HeartIcon } from "./icons";
import { EmptyState, LinkButton } from "./states";

const COPY = {
  favorites: {
    title: "Favorites",
    blurb: "Books you love.",
    emptyTitle: "No favorites yet",
    emptyMessage: "Tap the heart on any book and it will show up here.",
    band: "bg-peach",
  },
  wishlist: {
    title: "Wishlist",
    blurb: "Books you want to read next.",
    emptyTitle: "Your wishlist is empty",
    emptyMessage: "Tap the bookmark on a book you’d like to read later.",
    band: "bg-mint",
  },
} as const;

export default function CollectionPage({ name }: { name: CollectionName }) {
  const state = useLibraryState();
  // Server render has no access to localStorage; show a skeleton rather than flashing the empty state.
  const hydrated = useHydrated();
  const copy = COPY[name];
  const entries = state[name];

  return (
    <>
      <div className={copy.band}>
        <Container className="py-10">
          <h1 className="font-display text-4xl font-extrabold">{copy.title}</h1>
          <p role="status" className="mt-1 text-ink/80">
            {hydrated ? `${copy.blurb} ${entries.length} saved.` : copy.blurb}
          </p>
        </Container>
      </div>
      <Container className="py-10">
        {!hydrated ? (
          <BookGridSkeleton count={5} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={name === "favorites" ? <HeartIcon className="h-9 w-9" /> : <BookmarkIcon className="h-9 w-9" />}
            title={copy.emptyTitle}
            message={copy.emptyMessage}
          >
            <LinkButton href="/">Discover books</LinkButton>
            <LinkButton href="/search" variant="secondary">
              Search
            </LinkButton>
          </EmptyState>
        ) : (
          <BookGrid books={entries.map((e) => e.book)} />
        )}
      </Container>
    </>
  );
}
