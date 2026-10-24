import Hero from "@/components/Hero";
import ListPreviews from "@/components/ListPreviews";
import RecentlyViewed from "@/components/RecentlyViewed";
import SubjectTiles from "@/components/SubjectTiles";
import TrendingShelf from "@/components/TrendingShelf";
import type { Book } from "@/lib/books";
import { fetchTrending } from "@/lib/openlibrary";

// Trending changes slowly; an hour of caching keeps the home page fast and polite to Open Library.
export const revalidate = 3600;

async function loadTrending(): Promise<Book[] | null> {
  try {
    return (await fetchTrending(20)).books;
  } catch {
    // The client-side shelf retries and shows its own error state.
    return null;
  }
}

export default async function Home() {
  const trending = await loadTrending();
  return (
    <>
      <Hero featured={trending ?? []} />
      <SubjectTiles withHeading />
      <TrendingShelf initialBooks={trending} />
      <ListPreviews />
      <RecentlyViewed />
    </>
  );
}
