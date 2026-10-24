"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useLibraryState } from "@/lib/use-library";
import Avatar from "./Avatar";
import Container from "./Container";
import { BookmarkIcon, HeartIcon } from "./icons";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

function NavLink({
  href,
  label,
  count,
  children,
  textOnWide = true,
}: {
  href: string;
  label: string;
  count?: number;
  children?: React.ReactNode;
  textOnWide?: boolean;
}) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={count ? `${label}, ${count} saved` : label}
      className={`relative flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium hover:bg-line/60 ${
        active ? "bg-line/60" : ""
      }`}
    >
      {children}
      <span className={textOnWide ? "hidden sm:inline" : ""}>{label}</span>
      {count ? (
        <span className="min-w-5 rounded-full bg-ink px-1.5 text-center text-xs leading-5 text-white">{count}</span>
      ) : null}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { favorites, wishlist, profile } = useLibraryState();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-1">
          <span className="hidden sm:block">
            <NavLink href="/" label="Discover" textOnWide={false} />
          </span>
          <NavLink href="/favorites" label="Favorites" count={favorites.length}>
            <HeartIcon className="h-5 w-5 sm:hidden" />
          </NavLink>
          <NavLink href="/wishlist" label="Wishlist" count={wishlist.length}>
            <BookmarkIcon className="h-5 w-5 sm:hidden" />
          </NavLink>
          <Link
            href="/user"
            aria-label={`Profile: ${profile.name}`}
            className="ml-1 flex min-h-10 items-center rounded-full hover:ring-2 hover:ring-line"
          >
            <Avatar name={profile.name} />
          </Link>
        </nav>
      </Container>

      {/* The home page has its own large search in the hero. */}
      {pathname !== "/" && (
        <div className="border-t border-line bg-paper">
          <Container className="py-2">
            <Suspense fallback={<div className="skeleton h-11 rounded-full" />}>
              <SearchBar />
            </Suspense>
          </Container>
        </div>
      )}
    </header>
  );
}
