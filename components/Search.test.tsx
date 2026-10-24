import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dune, jsonResponse } from "@/tests/fixtures";
import { renderWithProviders } from "@/tests/render";

const nav = vi.hoisted(() => ({
  pathname: "/search",
  params: new URLSearchParams(),
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.params,
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
}));

import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";

beforeEach(() => {
  nav.pathname = "/search";
  nav.params = new URLSearchParams();
  nav.push.mockClear();
  nav.replace.mockClear();
});

describe("SearchBar", () => {
  it("debounces typing into a single URL update with a trimmed query", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<SearchBar />);
    await user.type(screen.getByRole("textbox"), "  dune  messiah ");
    expect(nav.replace).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(400));
    expect(nav.replace).toHaveBeenCalledTimes(1);
    expect(nav.replace).toHaveBeenCalledWith("/search?q=dune%20messiah");
  });

  it("submits immediately on Enter from another page, via push", async () => {
    nav.pathname = "/favorites";
    const user = userEvent.setup();
    renderWithProviders(<SearchBar />);
    await user.type(screen.getByRole("textbox"), "tolkien{Enter}");
    expect(nav.push).toHaveBeenCalledWith("/search?q=tolkien");
  });

  it("ignores an empty or whitespace-only submit", async () => {
    nav.pathname = "/";
    const user = userEvent.setup();
    renderWithProviders(<SearchBar />);
    await user.type(screen.getByRole("textbox"), "   {Enter}");
    expect(nav.push).not.toHaveBeenCalled();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("clears the input, refocuses it and resets the results page", async () => {
    nav.params = new URLSearchParams("q=dune");
    const user = userEvent.setup();
    renderWithProviders(<SearchBar />);
    expect(screen.getByRole("textbox")).toHaveValue("dune");
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(nav.replace).toHaveBeenCalledWith("/search");
  });
});

describe("SearchResults", () => {
  const pageOf = (n: number, total = n) => ({
    books: Array.from({ length: n }, (_, i) => ({ ...dune, id: `W${i}`, title: `Book ${i}` })),
    total,
    offset: 0,
  });

  it("shows the discovery prompt (no request) for an empty query", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<SearchResults />);
    expect(screen.getByRole("heading", { name: /what are you looking for/i })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a skeleton, then results with a count", async () => {
    nav.params = new URLSearchParams("q=dune");
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(pageOf(3, 87))));
    const { container } = renderWithProviders(<SearchResults />);
    expect(container.querySelector(".skeleton")).not.toBeNull();
    expect(await screen.findByText("Book 0")).toBeInTheDocument();
    expect(container.querySelector(".skeleton")).toBeNull();
    expect(screen.getByText("Showing 1–3 of 87 books")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute("href", "/search?q=dune&page=2");
  });

  it("shows an empty state (not an error) when nothing matches, with a way out", async () => {
    nav.params = new URLSearchParams("q=zzzzqq");
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ books: [], total: 0, offset: 0 })));
    renderWithProviders(<SearchResults />);
    expect(await screen.findByRole("heading", { name: /nothing matches/i })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/search");
  });

  it("shows an error with retry on API failure, and recovers", async () => {
    nav.params = new URLSearchParams("q=dune");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 502 }))
      .mockResolvedValueOnce(jsonResponse(pageOf(2)));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithProviders(<SearchResults />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/catalogue/i);
    expect(alert).toHaveTextContent(/favorites and wishlist are not affected/i);
    expect(screen.queryByText(/no books found/i)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Book 0")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("searches subjects from tiles and chips", async () => {
    nav.params = new URLSearchParams("subject=Fantasy&page=2");
    const fetchMock = vi.fn(async () => jsonResponse({ ...pageOf(2, 100), offset: 24 }));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<SearchResults />);
    expect(await screen.findByRole("heading", { name: "Subject: Fantasy" })).toBeInTheDocument();
    expect(String((fetchMock.mock.calls as unknown[][])[0][0])).toContain("subject=Fantasy");
    expect(String((fetchMock.mock.calls as unknown[][])[0][0])).toContain("offset=24");
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute("href", "/search?subject=Fantasy");
  });
});
