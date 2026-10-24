import { NextResponse, type NextRequest } from "next/server";
import { parseBooksParams } from "@/lib/books-request";
import { fetchBooksPage, UpstreamError } from "@/lib/openlibrary";

// Proxying keeps the Open Library User-Agent/timeout/caching policy in one
// place and hands the browser an already-normalised, small payload.
export async function GET(request: NextRequest) {
  const req = parseBooksParams(request.nextUrl.searchParams);
  if (!req) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    return NextResponse.json(await fetchBooksPage(req));
  } catch (err) {
    if (err instanceof UpstreamError) {
      return NextResponse.json(
        { error: "upstream", kind: err.kind },
        { status: err.kind === "timeout" ? 504 : 502 },
      );
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
