import type { Metadata } from "next";
import CollectionPage from "@/components/CollectionPage";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <CollectionPage name="wishlist" />;
}
