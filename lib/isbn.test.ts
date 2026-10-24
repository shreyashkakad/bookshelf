import { describe, expect, it } from "vitest";
import { isValidIsbn10, isValidIsbn13, looksLikeIsbn, pickBestIsbn } from "./isbn";

describe("isbn", () => {
  it("validates checksums", () => {
    expect(isValidIsbn13("9780441172719")).toBe(true);
    expect(isValidIsbn13("9780441172718")).toBe(false);
    expect(isValidIsbn10("0441172717")).toBe(true);
    expect(isValidIsbn10("080442957X")).toBe(true);
    expect(isValidIsbn10("0441172718")).toBe(false);
  });

  it("detects ISBN-shaped queries with hyphens and spaces", () => {
    expect(looksLikeIsbn(" 978-0-441-17271-9 ")).toBe(true);
    expect(looksLikeIsbn("0-8044-2957-x")).toBe(true);
    expect(looksLikeIsbn("dune")).toBe(false);
    expect(looksLikeIsbn("12345")).toBe(false);
  });

  it("prefers a valid ISBN-13, then ISBN-10, and ignores junk", () => {
    expect(pickBestIsbn(["0441172717", "9780441172719", "junk"])).toBe("9780441172719");
    expect(pickBestIsbn(["junk", "0441172717"])).toBe("0441172717");
    expect(pickBestIsbn(["9780441172710"])).toBeNull();
    expect(pickBestIsbn(undefined)).toBeNull();
    expect(pickBestIsbn([42, null])).toBeNull();
  });
});
