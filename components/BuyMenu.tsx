"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Book } from "@/lib/books";
import { RETAILERS, retailerSearchUrl } from "@/lib/buy";
import { ChevronDownIcon, ExternalIcon } from "./icons";

export default function BuyMenu({ book, className = "" }: { book: Book; className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-azure px-3 text-sm font-medium text-white transition-colors hover:bg-azure-deep"
      >
        Buy book
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={`Where to buy ${book.title}`}
          className="absolute inset-x-0 top-full z-30 mt-1.5 min-w-40 rounded-lg border border-line bg-white p-1.5 shadow-pop"
        >
          {RETAILERS.map((r) => (
            <a
              key={r.id}
              href={retailerSearchUrl(r.id, book)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex min-h-10 items-center justify-between gap-2 rounded-md px-2.5 text-sm font-medium hover:bg-paper"
            >
              <span>
                {r.label}
                <span className="sr-only"> search for {book.title}, opens in a new tab</span>
              </span>
              <ExternalIcon className="h-4 w-4 text-ink-soft" />
            </a>
          ))}
          <p className="px-2.5 pb-1 pt-1.5 text-xs text-ink-soft">Opens a store search. Price and stock are shown there.</p>
        </div>
      )}
    </div>
  );
}
