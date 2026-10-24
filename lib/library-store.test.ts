import { describe, expect, it, vi } from "vitest";
import {
  clearViewed,
  getState,
  isSaved,
  recordViewed,
  removeSaved,
  resetStoreCache,
  setProfileName,
  subscribe,
  toggleSaved,
} from "./library-store";
import { bare, dune } from "@/tests/fixtures";

const reload = () => resetStoreCache();

describe("library store", () => {
  it("adds, removes and toggles favorites", () => {
    expect(toggleSaved("favorites", dune)).toEqual({ saved: true, persisted: true });
    expect(isSaved("favorites", dune.id)).toBe(true);
    expect(toggleSaved("favorites", dune)).toMatchObject({ saved: false });
    expect(isSaved("favorites", dune.id)).toBe(false);
    toggleSaved("favorites", dune);
    removeSaved("favorites", dune.id);
    expect(getState().favorites).toHaveLength(0);
  });

  it("never stores a duplicate", () => {
    toggleSaved("wishlist", dune);
    toggleSaved("wishlist", dune);
    toggleSaved("wishlist", dune);
    expect(getState().wishlist).toHaveLength(1);
  });

  it("persists across a reload", () => {
    toggleSaved("favorites", dune);
    toggleSaved("wishlist", bare);
    reload();
    expect(getState().favorites.map((e) => e.book.id)).toEqual([dune.id]);
    expect(getState().wishlist.map((e) => e.book.id)).toEqual([bare.id]);
  });

  it("keeps favorites and wishlist independent", () => {
    toggleSaved("favorites", dune);
    toggleSaved("wishlist", dune);
    removeSaved("favorites", dune.id);
    expect(isSaved("favorites", dune.id)).toBe(false);
    expect(isSaved("wishlist", dune.id)).toBe(true);
    reload();
    expect(isSaved("wishlist", dune.id)).toBe(true);
  });

  it("puts the newest save first", () => {
    toggleSaved("favorites", dune);
    toggleSaved("favorites", bare);
    expect(getState().favorites.map((e) => e.book.id)).toEqual([bare.id, dune.id]);
  });

  it("recovers from corrupt and malformed stored data", () => {
    localStorage.setItem("bookshelf:v1:favorites", "{not json");
    localStorage.setItem("bookshelf:v1:wishlist", JSON.stringify([null, 5, { book: { title: "no id" } }, { book: dune, savedAt: 1 }, { book: dune, savedAt: 2 }]));
    localStorage.setItem("bookshelf:v1:profile", JSON.stringify({ name: 42 }));
    reload();
    const s = getState();
    expect(s.favorites).toEqual([]);
    expect(s.wishlist.map((e) => e.book.id)).toEqual([dune.id]);
    expect(s.profile.name).toBe("Reader");
  });

  it("keeps working in memory when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    expect(toggleSaved("favorites", dune)).toEqual({ saved: true, persisted: false });
    expect(isSaved("favorites", dune.id)).toBe(true);
  });

  it("does not crash when storage cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    reload();
    expect(getState().favorites).toEqual([]);
  });

  it("tracks recently viewed (most recent first, no duplicates, capped) and can clear it", () => {
    recordViewed(dune);
    recordViewed(bare);
    recordViewed(dune);
    expect(getState().recent.map((e) => e.book.id)).toEqual([dune.id, bare.id]);
    for (let i = 0; i < 20; i++) recordViewed({ ...dune, id: `b${i}` });
    expect(getState().recent).toHaveLength(12);
    clearViewed();
    expect(getState().recent).toHaveLength(0);
  });

  it("normalises the profile name", () => {
    setProfileName("   Asha   Rao  ");
    expect(getState().profile.name).toBe("Asha Rao");
    setProfileName("   ");
    expect(getState().profile.name).toBe("Reader");
    setProfileName("x".repeat(60));
    expect(getState().profile.name).toHaveLength(24);
  });

  it("notifies subscribers and syncs when another tab writes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    toggleSaved("favorites", dune);
    expect(listener).toHaveBeenCalledTimes(1);

    // Simulate another tab: storage already changed, then the event arrives.
    localStorage.setItem("bookshelf:v1:favorites", JSON.stringify([]));
    window.dispatchEvent(new StorageEvent("storage", { key: "bookshelf:v1:favorites" }));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(getState().favorites).toEqual([]);

    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
