"use client";

import ToastProvider from "./ToastProvider";
import { BookDetailProvider } from "./BookDetailProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <BookDetailProvider>{children}</BookDetailProvider>
    </ToastProvider>
  );
}
