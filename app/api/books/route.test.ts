// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { jsonResponse, rawDune } from "@/tests/fixtures";

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/books?${qs}`));
afterEach(() => vi.unstubAllGlobals());

describe("GET /api/books", () => {
  it("returns 400 for invalid params without hitting the API", async () => {
    const fn = vi.fn();
    vi.stubGlobal("fetch", fn);
    expect((await call("kind=search")).status).toBe(400);
    expect(fn).not.toHaveBeenCalled();
  });

  it("returns normalised results", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ numFound: 1, docs: [rawDune] })));
    const res = await call("kind=search&q=dune");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ total: 1, offset: 0, books: [{ id: "OL893415W" }] });
  });

  it("maps upstream failures to 502 and timeouts to 504", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("x", { status: 503 })));
    expect((await call("kind=search&q=dune")).status).toBe(502);
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new DOMException("t", "TimeoutError"))));
    expect((await call("kind=trending")).status).toBe(504);
  });
});
