"use client";

import { useLibraryState } from "@/lib/use-library";
import BookGrid from "./BookGrid";
import Container from "./Container";

export default function RecentlyViewed({ limit = 5 }: { limit?: number }) {
  const { recent } = useLibraryState();
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="py-10">
      <Container>
        <h2 id="recent-heading" className="mb-6 font-display text-3xl font-bold">
          Recently viewed
        </h2>
        <BookGrid books={recent.slice(0, limit).map((e) => e.book)} />
      </Container>
    </section>
  );
}
