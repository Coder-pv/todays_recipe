const SLOTS = ["breakfast", "lunch", "dinner"];

/** @param {object | null | undefined} plan */
export function sumCompletedCalories(plan) {
  if (!plan) return 0;
  let sum = 0;
  for (const s of SLOTS) {
    const m = plan[s];
    if (m?.completed) sum += Number(m.calories) || 0;
  }
  return sum;
}
