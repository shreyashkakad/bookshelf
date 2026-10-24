import { describe, expect, it } from "vitest";
import { normalizeQuery, parseBooksParams, requestToParams, type BooksRequest } from "./books-request";

const parse = (qs: string) => parseBooksParams(new URLSearchParams(qs));

describe("books request params", () => {
  it("round-trips every request kind", () => {
    const reqs: BooksRequest[] = [
      { kind: "search", query: "tolkien", offset: 24, limit: 24 },
      { kind: "subject", subject: "Science fiction", offset: 0, limit: 8 },
      { kind: "trending", limit: 20 },
    ];
    for (const r of reqs) expect(parseBooksParams(requestToParams(r))).toEqual(r);
  });

  it("normalises whitespace in queries", () => {
    expect(normalizeQuery("  harry   potter ")).toBe("harry potter");
    expect(parse("kind=search&q=%20%20dune%20%20")).toMatchObject({ query: "dune" });
  });

  it("rejects empty, oversized and malformed input", () => {
    expect(parse("kind=search&q=%20")).toBeNull();
    expect(parse("kind=search")).toBeNull();
    expect(parse(`kind=search&q=${"a".repeat(201)}`)).toBeNull();
    expect(parse("kind=search&q=a&offset=-1")).toBeNull();
    expect(parse("kind=search&q=a&offset=abc")).toBeNull();
    expect(parse("kind=search&q=a&limit=0")).toBeNull();
    expect(parse("kind=search&q=a&limit=500")).toBeNull();
    expect(parse("kind=bogus&q=a")).toBeNull();
  });
});
