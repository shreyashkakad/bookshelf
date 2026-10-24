import type { Metadata } from "next";
import CollectionPage from "@/components/CollectionPage";

export const metadata: Metadata = { title: "Favorites" };

export default function FavoritesPage() {
  return <CollectionPage name="favorites" />;
}
