import { describe, expect, it } from "vitest";
import { buySearchTerm, retailerSearchUrl } from "./buy";
import { bare, dune } from "@/tests/fixtures";

describe("buy links", () => {
  it("prefers the ISBN", () => {
    expect(retailerSearchUrl("amazon", dune)).toBe("https://www.amazon.in/s?k=9780441172719");
    expect(retailerSearchUrl("flipkart", dune)).toBe("https://www.flipkart.com/search?q=9780441172719");
  });

  it("falls back to title and first author, encoded", () => {
    const book = { ...dune, isbn: null, title: "Gödel, Escher & Bach: An Eternal Golden Braid", authors: ["Douglas R. Hofstadter", "Other"] };
    const url = new URL(retailerSearchUrl("amazon", book));
    expect(url.hostname).toBe("www.amazon.in");
    expect(url.searchParams.get("k")).toBe("Gödel, Escher & Bach: An Eternal Golden Braid Douglas R. Hofstadter");
    expect(url.search).not.toContain(" ");
    expect(url.search).not.toContain("&Bach");
  });

  it("works with no author and no ISBN", () => {
    expect(buySearchTerm({ ...bare, title: "  Some   Title " })).toBe("Some Title");
  });
});
