import type { Book } from "@/lib/books";

export const dune: Book = {
  id: "OL893415W",
  title: "Dune",
  authors: ["Frank Herbert"],
  coverId: 12345,
  isbn: "9780441172719",
  firstPublishYear: 1965,
  pages: 604,
  editionCount: 120,
  subjects: ["Science fiction"],
  readUrl: null,
};

export const bare: Book = {
  id: "OL1W",
  title: "Untitled",
  authors: [],
  coverId: null,
  isbn: null,
  firstPublishYear: null,
  pages: null,
  editionCount: null,
  subjects: [],
  readUrl: null,
};

export const rawDune = {
  key: "/works/OL893415W",
  title: "Dune",
  author_name: ["Frank Herbert"],
  cover_i: 12345,
  isbn: ["0441172717", "9780441172719", "not-an-isbn"],
  first_publish_year: 1965,
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }, ...init });
}
