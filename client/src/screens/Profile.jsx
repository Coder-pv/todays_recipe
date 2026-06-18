import { useEffect } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { fetchProfile, saveProfile, updateProfileForm } from "../store/profileSlice.js";
import { useDispatch, useSelector } from "../store/redux.js";

export default function Profile() {
  const dispatch = useDispatch();
  const { form, error, saveMessage, status } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  async function onSave(event) {
    event.preventDefault();
    try {
      await dispatch(saveProfile());
    } catch (_error) {
      // Error is already stored in the profile slice.
    }
  }

  if (status === "loading" && !form.username) {
    return <p style={{ color: "var(--color-text-soft)" }}>Loading profile...</p>;
  }

  return (
    <Card>
      <h1 style={{ marginTop: 0 }}>Profile</h1>
      <p style={{ color: "var(--color-text-soft)", marginTop: 0 }}>
        Your preferences are stored in Redux on the client and saved against your signed-in account.
      </p>
      <form onSubmit={onSave} style={{ display: "grid", gap: "1rem", maxWidth: 480 }}>
        <div>
          <label>Username</label>
          <input
            value={form.username}
            onChange={(event) => dispatch(updateProfileForm({ username: event.target.value }))}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="Your name"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => dispatch(updateProfileForm({ password: event.target.value }))}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="Set or update password"
          />
        </div>
        <div>
          <label>Dietary preference</label>
          <select
            value={form.dietaryPreference}
            onChange={(event) => dispatch(updateProfileForm({ dietaryPreference: event.target.value }))}
            style={{ width: "100%", marginTop: 4 }}
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="non_vegetarian">Non-vegetarian</option>
          </select>
        </div>
        <div>
          <label>Allergies (comma-separated)</label>
          <textarea
            value={form.allergiesText}
            onChange={(event) => dispatch(updateProfileForm({ allergiesText: event.target.value }))}
            rows={3}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="e.g. peanuts, dairy"
          />
        </div>
        <div>
          <label>Weight preference</label>
          <select
            value={form.healthGoal}
            onChange={(event) => dispatch(updateProfileForm({ healthGoal: event.target.value }))}
            style={{ width: "100%", marginTop: 4 }}
          >
            <option value="weight_loss">Weight loss</option>
            <option value="weight_gain">Weight gain</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label>Daily calorie target</label>
          <input
            type="number"
            min={500}
            max={8000}
            value={form.dailyCalorieTarget}
            onChange={(event) => dispatch(updateProfileForm({ dailyCalorieTarget: event.target.value }))}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>
        <div>
          <label>Meals per day</label>
          <select
            value={form.mealPattern}
            onChange={(event) => {
              const mealPattern = event.target.value;
              const map = {
                breakfast_lunch_snacks_dinner: 4,
                breakfast_lunch_dinner: 3,
                lunch_dinner: 2,
                meal_of_the_day: 1,
              };
              dispatch(updateProfileForm({ mealPattern, mealsPerDay: map[mealPattern] || 3 }));
            }}
            style={{ width: "100%", marginTop: 4 }}
          >
            <option value="breakfast_lunch_snacks_dinner">4 - breakfast, lunch, snacks, dinner</option>
            <option value="breakfast_lunch_dinner">3 - breakfast, lunch, dinner</option>
            <option value="lunch_dinner">2 - lunch, dinner</option>
            <option value="meal_of_the_day">1 - meal of the day</option>
          </select>
        </div>
        <div>
          <label>Meal distribution</label>
          <select
            value={form.mealDistribution}
            onChange={(event) => dispatch(updateProfileForm({ mealDistribution: event.target.value }))}
            style={{ width: "100%", marginTop: 4 }}
          >
            <option value="light_dinner">Light dinner</option>
            <option value="balanced">Balanced meals</option>
            <option value="heavy_breakfast">Heavy breakfast</option>
          </select>
        </div>
        <div>
          <label>Default serving size (people)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.defaultServingPeople}
            onChange={(event) => dispatch(updateProfileForm({ defaultServingPeople: event.target.value }))}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Saving..." : "Save"}
          </Button>
          {saveMessage ? <span style={{ color: "var(--color-brown-muted)" }}>{saveMessage}</span> : null}
          {error ? (
            <span style={{ color: "var(--color-orange)" }} role="alert">
              {error}
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
