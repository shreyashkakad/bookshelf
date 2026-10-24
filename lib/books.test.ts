import { describe, expect, it } from "vitest";
import { authorLine, normalizeBook, normalizeBooks, sanitizeBook } from "./books";
import { dune, rawDune } from "@/tests/fixtures";

describe("normalizeBook", () => {
  it("maps a full record and picks the valid ISBN-13", () => {
    const book = normalizeBook(rawDune)!;
    expect(book).toMatchObject({ id: "OL893415W", title: "Dune", authors: ["Frank Herbert"], coverId: 12345, isbn: "9780441172719", firstPublishYear: 1965 });
  });

  it("survives missing title, author, cover and ISBN", () => {
    const book = normalizeBook({ key: "/works/OL9W" })!;
    expect(book.title).toBe("Untitled");
    expect(book.authors).toEqual([]);
    expect(book.coverId).toBeNull();
    expect(book.isbn).toBeNull();
  });

  it("rejects records it cannot identify and non-objects", () => {
    expect(normalizeBook({ title: "No key" })).toBeNull();
    expect(normalizeBook(null)).toBeNull();
    expect(normalizeBook("x")).toBeNull();
    expect(normalizeBook([])).toBeNull();
  });

  it("falls back to the ISBN for identity when the key is missing", () => {
    expect(normalizeBook({ title: "X", isbn: ["9780441172719"] })!.id).toBe("isbn-9780441172719");
  });

  it("ignores nonsense cover ids and field types", () => {
    const book = normalizeBook({ key: "/works/OL9W", cover_i: -1, title: 5, author_name: "str", first_publish_year: "1999" })!;
    expect(book.coverId).toBeNull();
    expect(book.title).toBe("Untitled");
    expect(book.authors).toEqual([]);
    expect(book.firstPublishYear).toBeNull();
  });

  it("only exposes a read link for public-domain scans", () => {
    expect(normalizeBook({ key: "/works/A", ia: ["duneabc"], ebook_access: "public" })!.readUrl).toBe("https://archive.org/details/duneabc");
    expect(normalizeBook({ key: "/works/A", ia: ["duneabc"], ebook_access: "borrowable" })!.readUrl).toBeNull();
  });

  it("drops duplicates and bad entries from lists", () => {
    expect(normalizeBooks([rawDune, rawDune, null, { key: "/works/B", title: "B" }]).map((b) => b.id)).toEqual(["OL893415W", "B"]);
    expect(normalizeBooks("nope")).toEqual([]);
  });
});

describe("sanitizeBook", () => {
  it("round-trips a valid book", () => {
    expect(sanitizeBook(dune)).toEqual(dune);
  });

  it("refuses non-archive.org read links (stored data ends up in an href)", () => {
    expect(sanitizeBook({ ...dune, readUrl: "javascript:alert(1)" })!.readUrl).toBeNull();
  });

  it("rejects entries without an id", () => {
    expect(sanitizeBook({ title: "x" })).toBeNull();
    expect(sanitizeBook(undefined)).toBeNull();
  });
});

describe("authorLine", () => {
  it("handles zero, one, two and many authors", () => {
    expect(authorLine({ ...dune, authors: [] })).toBe("Unknown author");
    expect(authorLine({ ...dune, authors: ["A"] })).toBe("A");
    expect(authorLine({ ...dune, authors: ["A", "B"] })).toBe("A, B");
    expect(authorLine({ ...dune, authors: ["A", "B", "C", "D"] })).toBe("A, B +2");
  });
});
