import type { Book } from "./books";

export type Retailer = "amazon" | "flipkart";

export const RETAILERS: { id: Retailer; label: string }[] = [
  { id: "amazon", label: "Amazon.in" },
  { id: "flipkart", label: "Flipkart" },
];

/** ISBN finds the exact edition; title + first author is the fallback. */
export function buySearchTerm(book: Pick<Book, "isbn" | "title" | "authors">): string {
  if (book.isbn) return book.isbn;
  return [book.title, book.authors[0]].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

/**
 * These are store *search* pages, not product pages: the API gives us no
 * verified listing, price or stock, so we never claim any.
 */
export function retailerSearchUrl(retailer: Retailer, book: Pick<Book, "isbn" | "title" | "authors">): string {
  const term = encodeURIComponent(buySearchTerm(book));
  return retailer === "amazon"
    ? `https://www.amazon.in/s?k=${term}`
    : `https://www.flipkart.com/search?q=${term}`;
}
