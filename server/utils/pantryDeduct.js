/**
 * Normalize ingredient / pantry names for fuzzy matching.
 * @param {string} s
 */
export function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deduct quantities from pantry items by matching ingredient names.
 * Mutates pantry documents in memory (caller saves).
 * @param {{ _id?: import('mongoose').Types.ObjectId, name: string, quantity: number }[]} pantryDocs
 * @param {{ name: string, quantity?: number }[]} ingredientsUsed
 * @returns {{ deducted: { name: string, amount: number }[], unmatched: string[] }}
 */
export function applyPantryDeductions(pantryDocs, ingredientsUsed) {
  const deducted = [];
  const unmatched = [];
  const list = Array.isArray(ingredientsUsed) ? ingredientsUsed : [];

  for (const ing of list) {
    const want = normalizeName(ing.name);
    const take = Math.max(0, Number(ing.quantity) || 0);
    if (!want || take <= 0) continue;

    const match = pantryDocs.find((p) => normalizeName(p.name) === want);
    if (!match) {
      const partial = pantryDocs.find(
        (p) =>
          want.includes(normalizeName(p.name)) ||
          normalizeName(p.name).includes(want)
      );
      if (partial) {
        const before = partial.quantity;
        partial.quantity = Math.max(0, before - take);
        deducted.push({ name: partial.name, amount: Math.min(before, take) });
      } else {
        unmatched.push(ing.name);
      }
      continue;
    }

    const before = match.quantity;
    match.quantity = Math.max(0, before - take);
    deducted.push({ name: match.name, amount: Math.min(before, take) });
  }

  return { deducted, unmatched };
}
