export function cleanIsbn(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function isValidIsbn10(value: string): boolean {
  if (!/^\d{9}[\dX]$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += (value[i] === "X" ? 10 : Number(value[i])) * (10 - i);
  }
  return sum % 11 === 0;
}

export function isValidIsbn13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(value[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10 === Number(value[12]);
}

/** Shape check only: users mistype ISBNs, and we still want to search for them. */
export function looksLikeIsbn(query: string): boolean {
  return /^(\d{9}[\dX]|\d{13})$/.test(cleanIsbn(query));
}

/**
 * Open Library lists every edition's ISBN for a work, many of them malformed.
 * Only a checksum-valid code is safe to use in a retailer search, and ISBN-13
 * is preferred because it matches the most listings.
 */
export function pickBestIsbn(candidates: unknown): string | null {
  if (!Array.isArray(candidates)) return null;
  const cleaned = candidates
    .filter((c): c is string => typeof c === "string")
    .map(cleanIsbn);
  return (
    cleaned.find(isValidIsbn13) ?? cleaned.find(isValidIsbn10) ?? null
  );
}
