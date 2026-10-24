"use client";

import Link from "next/link";
import { useState } from "react";
import { clearViewed, DEFAULT_PROFILE_NAME, setProfileName } from "@/lib/library-store";
import { useLibraryState } from "@/lib/use-library";
import Avatar from "./Avatar";
import Container from "./Container";
import RecentlyViewed from "./RecentlyViewed";

function NameForm({ initial }: { initial: string }) {
  const [name, setName] = useState(initial);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileName(name);
  };
  return (
    <form onSubmit={save} className="mt-8 flex max-w-md flex-wrap items-end gap-3">
      <div className="flex-1">
        <label htmlFor="display-name" className="text-sm font-medium">
          Display name
        </label>
        <input
          id="display-name"
          value={name}
          maxLength={24}
          placeholder={DEFAULT_PROFILE_NAME}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-lg border border-line bg-white px-3"
        />
      </div>
      <button type="submit" className="min-h-11 rounded-lg bg-azure px-5 font-medium text-white hover:bg-azure-deep">
        Save name
      </button>
    </form>
  );
}

export default function ProfilePanel() {
  const { profile, favorites, wishlist, recent } = useLibraryState();
  const stat = "rounded-xl border border-line bg-white p-4 hover:bg-paper";
  return (
    <>
      <Container className="py-10">
        <div className="flex items-center gap-5">
          <Avatar name={profile.name} className="h-20 w-20 text-3xl" />
          <div>
            <h1 className="font-display text-4xl font-extrabold">{profile.name}</h1>
            <p className="text-ink-soft">A reading profile saved in this browser. No account needed.</p>
          </div>
        </div>

        {/* Keyed by the stored name so a change from another tab resets the field. */}
        <NameForm key={profile.name} initial={profile.name} />

        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
          <Link href="/favorites" className={stat}>
            <p className="font-display text-3xl font-bold">{favorites.length}</p>
            <p className="text-sm text-ink-soft">Favorites</p>
          </Link>
          <Link href="/wishlist" className={stat}>
            <p className="font-display text-3xl font-bold">{wishlist.length}</p>
            <p className="text-sm text-ink-soft">On your wishlist</p>
          </Link>
        </div>
      </Container>

      <RecentlyViewed limit={12} />
      {recent.length > 0 && (
        <Container>
          <button type="button" onClick={clearViewed} className="min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-medium hover:bg-paper">
            Clear viewing history
          </button>
        </Container>
      )}
    </>
  );
}
