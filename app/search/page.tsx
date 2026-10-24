import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/Container";
import { BookGridSkeleton } from "@/components/BookGrid";
import SearchResults from "@/components/SearchResults";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <BookGridSkeleton />
        </Container>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
