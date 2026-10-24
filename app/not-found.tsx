import Container from "@/components/Container";
import { BookOpenIcon } from "@/components/icons";
import { EmptyState, LinkButton } from "@/components/states";

export default function NotFound() {
  return (
    <Container>
      <EmptyState icon={<BookOpenIcon className="h-9 w-9" />} title="Page not found" message="That page isn’t on the shelf.">
        <LinkButton href="/">Back to discover</LinkButton>
      </EmptyState>
    </Container>
  );
}
