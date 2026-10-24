import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom does not implement <dialog> modal behaviour.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

beforeEach(async () => {
  if (typeof localStorage === "undefined") return; // node-environment tests
  localStorage.clear();
  const { resetStoreCache } = await import("@/lib/library-store");
  resetStoreCache();
});

afterEach(() => {
  if (typeof document !== "undefined") cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
