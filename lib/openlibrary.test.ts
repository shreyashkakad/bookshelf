import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSearchUrl, fetchTrending, sanitizeQuery, searchBooks, UpstreamError } from "./openlibrary";
import { jsonResponse, rawDune } from "@/tests/fixtures";

const search = (query: string) => ({ kind: "search" as const, query, offset: 0, limit: 24 });
const stubFetch = (impl: () => Promise<Response>) => {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
};

afterEach(() => vi.unstubAllGlobals());

describe("buildSearchUrl", () => {
  it("uses q for titles and authors", () => {
    const url = new URL(buildSearchUrl(search("Frank Herbert"))!);
    expect(url.pathname).toBe("/search.json");
    expect(url.searchParams.get("q")).toBe("Frank Herbert");
    expect(url.searchParams.get("fields")).toContain("cover_i");
    expect(url.searchParams.get("limit")).toBe("24");
  });

  it("uses the isbn parameter for ISBN-shaped input, ignoring hyphens", () => {
    const url = new URL(buildSearchUrl(search("978-0-441-17271-9"))!);
    expect(url.searchParams.get("isbn")).toBe("9780441172719");
    expect(url.searchParams.has("q")).toBe(false);
  });

  it("strips Solr operators that would be parsed as field filters", () => {
    expect(sanitizeQuery('Harry Potter: "Chamber" (of) Secrets*')).toBe("Harry Potter Chamber of Secrets");
    expect(new URL(buildSearchUrl(search("Spider-Man: Homecoming"))!).searchParams.get("q")).toBe("Spider Man Homecoming");
  });

  it("builds a quoted subject query", () => {
    const url = new URL(buildSearchUrl({ kind: "subject", subject: "Science fiction", offset: 0, limit: 8 })!);
    expect(url.searchParams.get("q")).toBe('subject:"Science fiction"');
  });

  it("returns null when nothing searchable remains", () => {
    expect(buildSearchUrl(search("?!*"))).toBeNull();
  });
});

describe("searchBooks", () => {
  it("returns normalised books and the total", async () => {
    stubFetch(async () => jsonResponse({ numFound: 87, docs: [rawDune] }));
    const page = await searchBooks(search("dune"));
    expect(page.total).toBe(87);
    expect(page.books[0]).toMatchObject({ id: "OL893415W", isbn: "9780441172719" });
  });

  it("treats an empty result set as success, not an error", async () => {
    stubFetch(async () => jsonResponse({ numFound: 0, docs: [] }));
    await expect(searchBooks(search("zzzz"))).resolves.toMatchObject({ books: [], total: 0 });
  });

  it("does not call the API for unsearchable input", async () => {
    const fn = stubFetch(async () => jsonResponse({}));
    await expect(searchBooks(search("???"))).resolves.toMatchObject({ books: [], total: 0 });
    expect(fn).not.toHaveBeenCalled();
  });

  it.each([
    ["network failure", () => Promise.reject(new TypeError("fetch failed")), "network"],
    ["timeout", () => Promise.reject(new DOMException("timed out", "TimeoutError")), "timeout"],
    ["HTTP 500", async () => new Response("oops", { status: 500 }), "http"],
    ["invalid JSON", async () => new Response("<html>", { status: 200 }), "invalid"],
    ["unexpected shape", async () => jsonResponse({ results: [] }), "invalid"],
    ["null body", async () => jsonResponse(null), "invalid"],
  ])("raises UpstreamError on %s", async (_label, impl, kind) => {
    stubFetch(impl);
    await expect(searchBooks(search("dune"))).rejects.toMatchObject({ name: "UpstreamError", kind });
  });

  it("falls back to the number of docs when numFound is missing", async () => {
    stubFetch(async () => jsonResponse({ docs: [rawDune] }));
    expect((await searchBooks(search("dune"))).total).toBe(1);
  });
});

describe("fetchTrending", () => {
  it("normalises works and removes duplicates", async () => {
    stubFetch(async () => jsonResponse({ works: [rawDune, rawDune] }));
    expect((await fetchTrending(10)).books).toHaveLength(1);
  });

  it("rejects an unexpected response", async () => {
    stubFetch(async () => jsonResponse({ docs: [] }));
    await expect(fetchTrending(10)).rejects.toBeInstanceOf(UpstreamError);
  });
});
