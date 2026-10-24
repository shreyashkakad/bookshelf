import { sanitizeBook, type Book } from "./books";

export type CollectionName = "favorites" | "wishlist";

export interface SavedBook {
  book: Book;
  savedAt: number;
}

export interface Profile {
  name: string;
}

export interface LibraryState {
  favorites: SavedBook[];
  wishlist: SavedBook[];
  recent: SavedBook[];
  profile: Profile;
}

export const DEFAULT_PROFILE_NAME = "Reader";
const MAX_NAME_LENGTH = 24;
const MAX_RECENT = 12;
const PREFIX = "bookshelf:v1:";

export const EMPTY_STATE: LibraryState = {
  favorites: [],
  wishlist: [],
  recent: [],
  profile: { name: DEFAULT_PROFILE_NAME },
};

// Favorites, wishlist and history are separate keys so a corrupt entry in one
// can never wipe out another.
let state: LibraryState | null = null;
const listeners = new Set<() => void>();

function readStored(name: string): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    // Storage blocked, or the value is not valid JSON: start from empty.
    return null;
  }
}

function sanitizeSavedList(raw: unknown): SavedBook[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: SavedBook[] = [];
  for (const entry of raw) {
    const book = sanitizeBook((entry as { book?: unknown } | null)?.book);
    if (!book || seen.has(book.id)) continue;
    seen.add(book.id);
    const savedAt = (entry as { savedAt?: unknown }).savedAt;
    out.push({ book, savedAt: typeof savedAt === "number" && Number.isFinite(savedAt) ? savedAt : 0 });
  }
  return out;
}

export function cleanProfileName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH) || DEFAULT_PROFILE_NAME;
}

function load(): LibraryState {
  const profile = readStored("profile") as { name?: unknown } | null;
  return {
    favorites: sanitizeSavedList(readStored("favorites")),
    wishlist: sanitizeSavedList(readStored("wishlist")),
    recent: sanitizeSavedList(readStored("recent")),
    profile: {
      name: typeof profile?.name === "string" ? cleanProfileName(profile.name) : DEFAULT_PROFILE_NAME,
    },
  };
}

export function getState(): LibraryState {
  return (state ??= load());
}

/** Returns false when the browser refused the write (private mode, quota, disabled storage). */
function commit<K extends keyof LibraryState>(key: K, value: LibraryState[K]): boolean {
  state = { ...getState(), [key]: value };
  let persisted = true;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    persisted = false;
  }
  listeners.forEach((l) => l());
  return persisted;
}

export function isSaved(name: CollectionName, id: string): boolean {
  return getState()[name].some((e) => e.book.id === id);
}

export function toggleSaved(name: CollectionName, book: Book): { saved: boolean; persisted: boolean } {
  const list = getState()[name];
  const exists = list.some((e) => e.book.id === book.id);
  const next = exists
    ? list.filter((e) => e.book.id !== book.id)
    : [{ book, savedAt: Date.now() }, ...list];
  return { saved: !exists, persisted: commit(name, next) };
}

export function removeSaved(name: CollectionName, id: string): boolean {
  return commit(name, getState()[name].filter((e) => e.book.id !== id));
}

export function recordViewed(book: Book): void {
  const rest = getState().recent.filter((e) => e.book.id !== book.id);
  commit("recent", [{ book, savedAt: Date.now() }, ...rest].slice(0, MAX_RECENT));
}

export function clearViewed(): void {
  commit("recent", []);
}

export function setProfileName(name: string): void {
  commit("profile", { name: cleanProfileName(name) });
}

function onStorage(e: StorageEvent) {
  // key === null means localStorage.clear() in another tab.
  if (e.key !== null && !e.key.startsWith(PREFIX)) return;
  state = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Test helper: drops the in-memory cache so the next read hits storage again. */
export function resetStoreCache(): void {
  state = null;
}
