import { describe, expect, it } from "vitest";
import { searchHref } from "./search-href";

describe("searchHref", () => {
  it("trims, collapses and encodes", () => {
    expect(searchHref("  harry   potter & co ")).toBe("/search?q=harry%20potter%20%26%20co");
  });
  it("goes to the bare search page for an empty query", () => {
    expect(searchHref("   ")).toBe("/search");
  });
});
