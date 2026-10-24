import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <Container className="flex flex-col gap-2 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          Book data and covers from{" "}
          <a
            href="https://openlibrary.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-azure underline underline-offset-2 hover:text-azure-deep"
          >
            Open Library
          </a>
          .
        </p>
        <p>Your favorites and wishlist live in this browser only.</p>
      </Container>
    </footer>
  );
}
