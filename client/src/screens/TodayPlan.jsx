import { useEffect } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { todayKey } from "../lib/dates.js";
import { fetchPlan, generatePlan, toggleMeal } from "../store/planSlice.js";
import { useDispatch, useSelector } from "../store/redux.js";

const SLOTS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" },
  { key: "mealOfTheDay", label: "Meal of the day" },
];

export default function TodayPlan() {
  const dispatch = useDispatch();
  const date = todayKey();
  const plan = useSelector((state) => state.plan.data);
  const busy = useSelector((state) => state.plan.status === "loading");
  const error = useSelector((state) => state.plan.error);
  const note = useSelector((state) => state.plan.note);
  const servingPeople = useSelector(
    (state) => state.profile.data?.defaultServingPeople ?? state.profile.form.defaultServingPeople ?? 2
  );

  useEffect(() => {
    dispatch(fetchPlan(date));
  }, [date, dispatch]);

  async function onGenerate() {
    try {
      await dispatch(generatePlan(date, servingPeople));
    } catch (_error) {
      // Error is already stored in the plan slice.
    }
  }

  const activeSlots =
    Array.isArray(plan?.availableSlots) && plan.availableSlots.length
      ? SLOTS.filter((slot) => plan.availableSlots.includes(slot.key))
      : SLOTS.filter((slot) => ["breakfast", "lunch", "dinner"].includes(slot.key));
  const totalCalories = activeSlots.reduce((sum, { key }) => sum + (Number(plan?.[key]?.calories) || 0), 0);
  const completedCount = activeSlots.filter(({ key }) => plan?.[key]?.completed).length;
  const aiLabel =
    plan?.source === "stub"
      ? "Ready"
      : plan?.source === "openai"
        ? "OpenAI"
        : plan?.source === "openrouter"
          ? "OpenRouter"
          : "Ready";

  return (
    <div className="today-page">
      <section className="today-hero">
        <div className="today-hero__content">
          <div className="today-kicker">{aiLabel}</div>
          <h1>Your Today&apos;s Recipe</h1>
          <p>
            {date} - {servingPeople} {servingPeople === 1 ? "serving" : "servings"} - {activeSlots.length} planned
            meals
          </p>
          <div className="today-hero__actions">
            <Button type="button" disabled={busy} onClick={onGenerate} className="button--large">
              {busy ? "Generating..." : "Generate recipe plan"}
            </Button>
            <span className="today-source">{totalCalories} kcal planned</span>
          </div>
        </div>
        <div className="today-hero__metrics" aria-label="Plan summary">
          <div>
            <strong>{activeSlots.length}</strong>
            <span>Meals</span>
          </div>
          <div>
            <strong>{completedCount}</strong>
            <span>Done</span>
          </div>
          <div>
            <strong>{totalCalories}</strong>
            <span>Kcal</span>
          </div>
        </div>
      </section>

      {note || error ? (
        <Card className={error ? "today-alert today-alert--error" : "today-alert"}>
          {note ? <p>{note}</p> : null}
          {error ? <p role="alert">{error}</p> : null}
        </Card>
      ) : null}

      <div className="meal-grid">
        {activeSlots.map(({ key, label }) => {
          const meal = plan?.[key] ?? {};
          const recipeIngredients = Array.isArray(meal.recipeIngredients) ? meal.recipeIngredients : [];
          const steps = Array.isArray(meal.steps) ? meal.steps : [];

          return (
            <Card key={key} className={`meal-card ${meal.completed ? "meal-card--done" : ""}`}>
              <div className="meal-card__top">
                <div>
                  <span className="meal-card__slot">{label}</span>
                  <h2>{meal.title || "Recipe pending"}</h2>
                </div>
                <label className="meal-card__check">
                  <input
                    type="checkbox"
                    checked={Boolean(meal.completed)}
                    onChange={(event) => dispatch(toggleMeal(date, key, event.target.checked))}
                  />
                  <span>Completed</span>
                </label>
              </div>

              <p className="meal-card__description">{meal.description || "Generate a plan to see recipes here."}</p>

              <div className="meal-card__meta">
                <span>{meal.calories ?? 0} kcal</span>
                <span>{recipeIngredients.length} ingredients</span>
                <span>{steps.length} steps</span>
              </div>

              {recipeIngredients.length > 0 ? (
                <section className="recipe-section">
                  <h3>Ingredients</h3>
                  <ul className="recipe-list">
                    {recipeIngredients.map((item) => (
                      <li key={`${key}-recipe-${item.name}`}>
                        <span>{item.name}</span>
                        <strong>{[item.quantity, item.unit].filter(Boolean).join(" ")}</strong>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {steps.length > 0 ? (
                <section className="recipe-section">
                  <h3>Method</h3>
                  <ol className="recipe-steps">
                    {steps.map((step, index) => (
                      <li key={`${key}-step-${index + 1}`}>{step}</li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {Array.isArray(meal.ingredientsUsed) && meal.ingredientsUsed.length > 0 ? (
                <div className="meal-card__pantry">
                  {meal.ingredientsUsed.map((item) => (
                    <span key={`${key}-${item.name}`}>
                      {item.name} - {item.quantity}
                    </span>
                  ))}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
