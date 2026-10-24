import { render } from "@testing-library/react";
import Providers from "@/components/Providers";

export function renderWithProviders(ui: React.ReactElement) {
  return render(<Providers>{ui}</Providers>);
}
