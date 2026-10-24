import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Bookshelf home">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1e1b2e" />
        <rect x="7" y="7" width="5" height="18" rx="1" fill="#bfdbd3" />
        <rect x="13.5" y="9" width="5" height="16" rx="1" fill="#f6e7bc" />
        <rect x="19.4" y="8" width="5" height="17" rx="1" fill="#f4cfc0" transform="rotate(10 21.9 16.5)" />
      </svg>
      <span className="font-display text-2xl font-bold tracking-tight">Bookshelf</span>
    </Link>
  );
}
