import { describe, it, expect } from "vitest";
import { normalizeName, applyPantryDeductions } from "../pantryDeduct.js";

describe("normalizeName", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeName("  Peanuts!  ")).toBe("peanuts");
  });
});

describe("applyPantryDeductions", () => {
  it("deducts exact name match", () => {
    const pantry = [{ name: "rice", quantity: 5 }];
    const { deducted, unmatched } = applyPantryDeductions(pantry, [
      { name: "rice", quantity: 2 },
    ]);
    expect(pantry[0].quantity).toBe(3);
    expect(deducted).toEqual([{ name: "rice", amount: 2 }]);
    expect(unmatched).toEqual([]);
  });

  it("caps deduction at available quantity", () => {
    const pantry = [{ name: "milk", quantity: 1 }];
    const { deducted } = applyPantryDeductions(pantry, [{ name: "milk", quantity: 10 }]);
    expect(pantry[0].quantity).toBe(0);
    expect(deducted).toEqual([{ name: "milk", amount: 1 }]);
  });

  it("records unmatched when missing", () => {
    const pantry = [{ name: "rice", quantity: 2 }];
    const { unmatched } = applyPantryDeductions(pantry, [{ name: "saffron", quantity: 1 }]);
    expect(unmatched).toContain("saffron");
  });
});
