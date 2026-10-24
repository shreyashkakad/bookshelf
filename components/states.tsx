import Link from "next/link";
import type { BooksApiErrorKind } from "@/lib/client-api";
import { AlertIcon } from "./icons";

export function EmptyState({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-butter text-ink">{icon}</div>
      <h2 className="mt-6 font-display text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-ink-soft">{message}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

const ERROR_COPY: Record<BooksApiErrorKind, { title: string; message: string }> = {
  offline: { title: "Can’t reach the catalogue", message: "Check your internet connection, then try again." },
  timeout: { title: "The catalogue is slow to respond", message: "Open Library is taking too long. Try again in a moment." },
  server: { title: "The catalogue is having trouble", message: "Something went wrong on Open Library’s side. Try again shortly." },
  invalid: { title: "The catalogue sent back something unexpected", message: "Try again. If it keeps happening, come back later." },
};

export function ErrorState({ kind, onRetry }: { kind: BooksApiErrorKind; onRetry: () => void }) {
  const copy = ERROR_COPY[kind];
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-peach text-ink">
        <AlertIcon className="h-9 w-9" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold">{copy.title}</h2>
      <p className="mt-2 text-ink-soft">{copy.message}</p>
      <p className="mt-1 text-sm text-ink-soft">Your favorites and wishlist are not affected.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 min-h-11 rounded-lg bg-azure px-5 font-medium text-white hover:bg-azure-deep"
      >
        Try again
      </button>
    </div>
  );
}

export const primaryLink =
  "inline-flex min-h-11 items-center rounded-lg bg-azure px-5 font-medium text-white hover:bg-azure-deep";
export const secondaryLink =
  "inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-5 font-medium hover:bg-paper";

export function LinkButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={variant === "primary" ? primaryLink : secondaryLink}>
      {children}
    </Link>
  );
}
