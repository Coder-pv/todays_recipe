import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useClientId } from "../hooks/useClientId.js";
import { getDashboard } from "../api/client.js";
import { todayKey } from "../lib/dates.js";
import Card from "../components/Card.jsx";
import { BrandHero, UserReviewsSection } from "../components/BrandSections.jsx";

const SLOTS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

export default function Dashboard() {
  const clientId = useClientId();
  const [dash, setDash] = useState(null);
  const [err, setErr] = useState("");

  const date = todayKey();

  useEffect(() => {
    if (!clientId) return;
    getDashboard(clientId, date)
      .then(setDash)
      .catch((e) => setErr(e.message));
  }, [clientId, date]);

  if (!clientId) return <p>Loading…</p>;

  const chartData =
    dash?.weeklyCalories?.map((w) => ({
      day: w.date.slice(5),
      kcal: w.consumed,
    })) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      <h1 className="font-sans-heading" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-heading)" }}>
        Your dashboard
      </h1>
      <p style={{ margin: "-0.5rem 0 0", color: "var(--color-text-muted)", fontSize: "0.95rem", maxWidth: 520 }}>
        Calories, pantry snapshot, and today&apos;s meals — everything in one place.
      </p>
      {err ? (
        <p style={{ color: "var(--color-brand)" }} role="alert">
          {err}
        </p>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <Card>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Consumed</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand)" }}>
            {dash ? dash.consumedCalories : "—"} kcal
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Remaining</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-forest)" }}>
            {dash ? dash.remainingCalories : "—"} kcal
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Daily target</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-muted)" }}>
            {dash ? dash.dailyCalorieTarget : "—"} kcal
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-sans-heading" style={{ marginTop: 0, fontSize: "1.15rem", fontWeight: 700 }}>
          Weekly calories (completed meals)
        </h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis dataKey="day" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="kcal" fill="var(--color-brand)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <Card>
          <h2 className="font-sans-heading" style={{ marginTop: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            Pantry overview
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginTop: 0 }}>
            {dash ? `${dash.pantryOverview.itemCount} items · total qty ${dash.pantryOverview.totalQuantity}` : "—"}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            {(dash?.pantryOverview?.items ?? []).map((p) => (
              <li key={p._id}>
                <strong style={{ color: "var(--color-brand)" }}>{p.name}</strong> — {p.quantity} {p.unit}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-sans-heading" style={{ marginTop: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            Today&apos;s meal plan
          </h2>
          {!dash?.mealPlan ? (
            <p style={{ color: "var(--color-text-muted)" }}>No plan yet — generate on Today&apos;s Plan.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {SLOTS.map(({ key, label }) => {
                const m = dash.mealPlan[key];
                return (
                  <li key={key} style={{ marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
                    <strong style={{ color: "var(--color-brand)" }}>{label}</strong>
                    {m?.title ? ` — ${m.title}` : ""}
                    {m?.completed ? (
                      <span style={{ color: "var(--color-forest)", marginLeft: 6, fontWeight: 600 }}>(done)</span>
                    ) : null}
                    <div style={{ fontSize: "0.85rem" }}>{m?.calories ?? 0} kcal</div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
