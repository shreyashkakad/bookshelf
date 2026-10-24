"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Book } from "./books";
import {
  EMPTY_STATE,
  getState,
  isSaved,
  subscribe,
  toggleSaved,
  type CollectionName,
} from "./library-store";
import { useToast } from "@/components/ToastProvider";

const getServerState = () => EMPTY_STATE;

export function useLibraryState() {
  return useSyncExternalStore(subscribe, getState, getServerState);
}

/** False during server render and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Subscribes to a single boolean, so toggling one book re-renders only the
 * cards for that book rather than every card on the page.
 */
function useIsSaved(name: CollectionName, id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isSaved(name, id),
    () => false,
  );
}

const LABEL: Record<CollectionName, string> = { favorites: "Favorites", wishlist: "Wishlist" };

export function useBookActions(book: Book) {
  const { notify } = useToast();
  const favorite = useIsSaved("favorites", book.id);
  const wishlist = useIsSaved("wishlist", book.id);

  const toggle = useCallback(
    (name: CollectionName) => {
      const { saved, persisted } = toggleSaved(name, book);
      const verb = saved ? `added to ${LABEL[name]}` : `removed from ${LABEL[name]}`;
      notify(
        persisted
          ? `“${book.title}” ${verb}`
          : `“${book.title}” ${verb}, but this browser blocked saving. It will be lost on reload.`,
      );
    },
    [book, notify],
  );

  return {
    favorite,
    wishlist,
    toggleFavorite: useCallback(() => toggle("favorites"), [toggle]),
    toggleWishlist: useCallback(() => toggle("wishlist"), [toggle]),
  };
}
