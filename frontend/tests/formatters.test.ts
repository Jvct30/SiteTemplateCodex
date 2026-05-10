import { describe, expect, it } from "vitest";

import { formatMoney, toCurrencyNumber } from "../src/lib/formatters";

describe("formatters", () => {
  it("formats values as Brazilian currency", () => {
    expect(formatMoney(25.9).replace("\u00a0", " ")).toBe("R$ 25,90");
  });

  it("returns zero for invalid numeric input", () => {
    expect(toCurrencyNumber("not-a-number")).toBe(0);
  });
});
