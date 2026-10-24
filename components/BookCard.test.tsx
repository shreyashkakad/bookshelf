import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import BookCard from "./BookCard";
import CollectionPage from "./CollectionPage";
import Cover from "./Cover";
import { getState } from "@/lib/library-store";
import { bare, dune } from "@/tests/fixtures";
import { renderWithProviders } from "@/tests/render";

describe("BookCard", () => {
  it("favorites and un-favorites with immediate state, a toast, and persistence", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookCard book={dune} />);
    const heart = screen.getByRole("button", { name: /favorite “dune”/i });
    expect(heart).toHaveAttribute("aria-pressed", "false");

    await user.click(heart);
    expect(heart).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("“Dune” added to Favorites");
    expect(JSON.parse(localStorage.getItem("bookshelf:v1:favorites")!)).toHaveLength(1);

    await user.click(heart);
    expect(heart).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent("removed from Favorites");
  });

  it("keeps wishlist independent of favorites", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookCard book={dune} />);
    await user.click(screen.getByRole("button", { name: /favorite “dune”/i }));
    await user.click(screen.getByRole("button", { name: /wishlist/i }));
    await user.click(screen.getByRole("button", { name: /favorite “dune”/i }));

    expect(screen.getByRole("button", { name: /favorite “dune”/i })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /wishlist/i })).toHaveAttribute("aria-pressed", "true");
    expect(getState().wishlist).toHaveLength(1);
  });

  it("shows the saved state on a fresh render (e.g. after a reload)", async () => {
    const user = userEvent.setup();
    const first = renderWithProviders(<BookCard book={dune} />);
    await user.click(screen.getByRole("button", { name: /favorite “dune”/i }));
    first.unmount();
    renderWithProviders(<BookCard book={dune} />);
    expect(screen.getByRole("button", { name: /favorite “dune”/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders a book with every optional field missing, without undefined/null text", () => {
    const { container } = renderWithProviders(<BookCard book={bare} />);
    expect(screen.getAllByText("Unknown author").length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/undefined|null|NaN/);
    expect(container.querySelector("img")).toBeNull();
  });

  it("buy menu offers both retailers as safe, new-tab ISBN searches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookCard book={dune} />);
    await user.click(screen.getByRole("button", { name: /buy book/i }));
    const group = screen.getByRole("group", { name: /where to buy dune/i });
    const links = within(group).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "https://www.amazon.in/s?k=9780441172719",
      "https://www.flipkart.com/search?q=9780441172719",
    ]);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("closes the buy menu with Escape and returns focus to the button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookCard book={dune} />);
    const button = screen.getByRole("button", { name: /buy book/i });
    await user.click(button);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("group", { name: /where to buy/i })).toBeNull();
    expect(button).toHaveFocus();
  });

  it("opens the detail dialog from the title and records the book as recently viewed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookCard book={dune} />);
    await user.click(screen.getByRole("button", { name: "Dune" }));
    const dialog = screen.getByRole("dialog", { name: "Dune" });
    expect(within(dialog).getByText("1965")).toBeInTheDocument();
    expect(within(dialog).getByText("604")).toBeInTheDocument();
    expect(getState().recent.map((e) => e.book.id)).toEqual([dune.id]);
    await user.click(within(dialog).getByRole("button", { name: /close details/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the read-online link only when a public scan exists", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookCard book={{ ...dune, readUrl: "https://archive.org/details/dune00herb" }} />);
    await user.click(screen.getByRole("button", { name: "Dune" }));
    const link = screen.getByRole("link", { name: /read free/i });
    expect(link).toHaveAttribute("href", "https://archive.org/details/dune00herb");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("Cover", () => {
  it("falls back to the designed placeholder when the image fails", async () => {
    const { container } = renderWithProviders(<Cover book={dune} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toContain("/b/id/12345-M.jpg");
    img.dispatchEvent(new Event("error"));
    await screen.findByText("Frank Herbert");
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Dune")).toBeInTheDocument();
  });
});

describe("CollectionPage", () => {
  it("shows distinct empty states with a way back to discovery", () => {
    const { unmount } = renderWithProviders(<CollectionPage name="favorites" />);
    expect(screen.getByRole("heading", { name: "No favorites yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Discover books" })).toHaveAttribute("href", "/");
    unmount();
    renderWithProviders(<CollectionPage name="wishlist" />);
    expect(screen.getByRole("heading", { name: "Your wishlist is empty" })).toBeInTheDocument();
  });

  it("lists only the books saved to that collection, and removal updates the page", async () => {
    const user = userEvent.setup();
    const card = renderWithProviders(<BookCard book={dune} />);
    await user.click(screen.getByRole("button", { name: /favorite “dune”/i }));
    card.unmount();

    renderWithProviders(<CollectionPage name="favorites" />);
    expect(screen.getByRole("button", { name: "Dune" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /favorite “dune”/i }));
    expect(screen.getByRole("heading", { name: "No favorites yet" })).toBeInTheDocument();
  });

  it("does not show favorites in the wishlist", async () => {
    const user = userEvent.setup();
    const card = renderWithProviders(<BookCard book={dune} />);
    await user.click(screen.getByRole("button", { name: /favorite “dune”/i }));
    card.unmount();
    renderWithProviders(<CollectionPage name="wishlist" />);
    expect(screen.getByRole("heading", { name: "Your wishlist is empty" })).toBeInTheDocument();
  });
});
