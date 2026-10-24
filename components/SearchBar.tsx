"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { normalizeQuery } from "@/lib/books-request";
import { searchHref } from "@/lib/search-href";
import { CloseIcon, SearchIcon } from "./icons";

const DEBOUNCE_MS = 350;

export default function SearchBar({ size = "md" }: { size?: "md" | "lg" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const onSearchPage = pathname === "/search";
  const urlQuery = onSearchPage ? (params.get("q") ?? "") : "";

  const [value, setValue] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Follow the URL for back/forward navigation, but never overwrite what the
  // user is mid-typing: the URL holds the trimmed, collapsed form of the input.
  // Adjusting during render (rather than in an effect) avoids a flash of stale text.
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  if (seenUrlQuery !== urlQuery) {
    setSeenUrlQuery(urlQuery);
    if (normalizeQuery(value) !== urlQuery) setValue(urlQuery);
  }

  // Live search only on the results page. Replacing (not pushing) history keeps
  // the back button from stepping through every intermediate keystroke.
  useEffect(() => {
    if (!onSearchPage || normalizeQuery(value) === urlQuery) return;
    const timer = setTimeout(() => router.replace(searchHref(value)), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, onSearchPage, urlQuery, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = normalizeQuery(value);
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    // Pushing on submit from elsewhere lets "back" return to where they were.
    (onSearchPage ? router.replace : router.push)(searchHref(q));
  };

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
    if (onSearchPage) router.replace("/search");
  };

  const large = size === "lg";
  return (
    <form
      role="search"
      onSubmit={submit}
      className={`flex w-full items-center rounded-full border border-line bg-white shadow-sm focus-within:border-azure focus-within:ring-2 focus-within:ring-azure/30 ${
        large ? "py-1.5 pl-5 pr-1.5" : "py-0.5 pl-4 pr-1"
      }`}
    >
      <label htmlFor={`search-${size}`} className="sr-only">
        Search books by title, author or ISBN
      </label>
      <SearchIcon className="h-5 w-5 shrink-0 text-ink-soft" />
      <input
        id={`search-${size}`}
        ref={inputRef}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title, author or ISBN"
        className={`min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-ink-soft/80 ${
          large ? "min-h-12 text-base" : "min-h-10 text-sm"
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-azure font-medium text-white hover:bg-azure-deep ${
          large ? "min-h-12 px-6" : "min-h-10 px-4 text-sm"
        }`}
      >
        Search
      </button>
    </form>
  );
}
