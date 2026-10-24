"use client";

import Container from "@/components/Container";
import { AlertIcon } from "@/components/icons";
import { EmptyState } from "@/components/states";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <EmptyState
        icon={<AlertIcon className="h-9 w-9" />}
        title="Something went wrong"
        message="This page hit an error. Your favorites and wishlist are safe."
      >
        <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-azure px-5 font-medium text-white hover:bg-azure-deep">
          Try again
        </button>
      </EmptyState>
    </Container>
  );
}
