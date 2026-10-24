# Bookshelf

Search millions of books (data and covers from [Open Library](https://openlibrary.org)), then keep favorites and a wishlist in your browser.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit + component tests, API mocked) |

## How it works

- `app/api/books` proxies Open Library (timeouts, User-Agent, caching) and returns normalised books. Search accepts a title, author or ISBN; ISBN-shaped input uses Open Library's `isbn` filter.
- `lib/library-store.ts` holds favorites, wishlist, recently viewed and the local profile in `localStorage` (keys `bookshelf:v1:*`), synced across tabs via the `storage` event. There is no account system.
- Buy links open Amazon.in / Flipkart **search** pages (ISBN first, else title + author). They are not verified product pages, and no price or stock is claimed.

No environment variables are needed.
