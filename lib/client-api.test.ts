import { describe, expect, it, vi } from "vitest";
import { fetchBooks } from "./client-api";
import { jsonResponse } from "@/tests/fixtures";

const req = { kind: "search" as const, query: "dune", offset: 0, limit: 24 };
const page = { books: [], total: 0, offset: 0 };

describe("fetchBooks", () => {
  it("returns a valid page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(page)));
    await expect(fetchBooks(req)).resolves.toEqual(page);
  });

  it.each([
    ["network down", () => Promise.reject(new TypeError("Failed to fetch")), "offline"],
    ["HTTP 502", async () => new Response("", { status: 502 }), "server"],
    ["HTTP 504", async () => new Response("", { status: 504 }), "timeout"],
    ["bad JSON", async () => new Response("nope"), "invalid"],
    ["wrong shape", async () => jsonResponse({ books: "x" }), "invalid"],
  ])("maps %s to %s", async (_l, impl, kind) => {
    vi.stubGlobal("fetch", vi.fn(impl));
    await expect(fetchBooks(req)).rejects.toMatchObject({ kind });
  });

  it("rethrows the abort when the caller cancels", async () => {
    const ctl = new AbortController();
    vi.stubGlobal("fetch", vi.fn((_u: string, init: RequestInit) => new Promise((_r, rej) => {
      init.signal!.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")));
    })));
    const p = fetchBooks(req, ctl.signal);
    ctl.abort();
    await expect(p).rejects.toMatchObject({ name: "AbortError" });
  });
});
