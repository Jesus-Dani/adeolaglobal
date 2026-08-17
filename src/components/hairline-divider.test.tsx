import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HairlineDivider } from "./hairline-divider";

describe("HairlineDivider", () => {
  it("renders as a decorative, screen-reader-hidden element", () => {
    render(<HairlineDivider />);
    const divider = screen.getByRole("presentation", { hidden: true });
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute("aria-hidden", "true");
  });
});
