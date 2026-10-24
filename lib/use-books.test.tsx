import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBooks } from "./use-books";
import type { BooksRequest } from "./books-request";
import { dune, jsonResponse } from "@/tests/fixtures";

const search = (query: string): BooksRequest => ({ kind: "search", query, offset: 0, limit: 24 });
const pageOf = (title: string) => ({ books: [{ ...dune, id: title, title }], total: 1, offset: 0 });

function deferred() {
  let resolve!: (r: Response) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<Response>((res, rej) => ((resolve = res), (reject = rej)));
  return { promise, resolve, reject };
}

describe("useBooks", () => {
  it("stays idle without a request", () => {
    const { result } = renderHook(() => useBooks(null));
    expect(result.current.status).toBe("idle");
  });

  it("ignores a slow, superseded response (stale results never win)", async () => {
    const slow = deferred();
    const fast = deferred();
    const fetchMock = vi.fn((url: string) => (url.includes("q=old") ? slow.promise : fast.promise));
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(({ q }) => useBooks(search(q)), { initialProps: { q: "old" } });
    expect(result.current.status).toBe("loading");

    rerender({ q: "new" });
    expect(result.current.status).toBe("loading");

    await act(async () => fast.resolve(jsonResponse(pageOf("New book"))));
    await waitFor(() => expect(result.current.status).toBe("success"));

    // The old request answers last; it must not overwrite the newer results.
    await act(async () => slow.resolve(jsonResponse(pageOf("Old book"))));
    expect(result.current).toMatchObject({ status: "success", page: { books: [{ title: "New book" }] } });
  });

  it("never shows the previous query's results while the next one loads", async () => {
    const second = deferred();
    vi.stubGlobal("fetch", vi.fn((url: string) => (url.includes("q=a") ? Promise.resolve(jsonResponse(pageOf("A"))) : second.promise)));

    const { result, rerender } = renderHook(({ q }) => useBooks(search(q)), { initialProps: { q: "a" } });
    await waitFor(() => expect(result.current.status).toBe("success"));
    rerender({ q: "b" });
    expect(result.current.status).toBe("loading");
  });

  it("reports errors and recovers on retry", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(jsonResponse(pageOf("Back")));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useBooks(search("dune")));
    await waitFor(() => expect(result.current).toMatchObject({ status: "error", error: { kind: "offline" } }));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("aborts the in-flight request on unmount", async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn((_u: string, init: RequestInit) => {
      signal = init.signal!;
      return new Promise(() => {});
    }));
    const { unmount } = renderHook(() => useBooks(search("dune")));
    await waitFor(() => expect(signal).toBeDefined());
    unmount();
    expect(signal!.aborted).toBe(true);
  });
});
