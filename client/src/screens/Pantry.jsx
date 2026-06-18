import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { addPantryItem, fetchPantry, removePantryItem, updatePantryItem } from "../store/pantrySlice.js";
import { fetchProfile } from "../store/profileSlice.js";
import { useDispatch, useSelector } from "../store/redux.js";

const UNIT_OPTIONS = [
  { value: "tsp", label: "Teaspoon (tsp)" },
  { value: "Tbsp", label: "Tablespoon (Tbsp)" },
  { value: "fl oz", label: "Fluid Ounce (fl oz)" },
  { value: "c", label: "Cup (c)" },
  { value: "pt", label: "Pint (pt)" },
  { value: "qt", label: "Quart (qt)" },
  { value: "gal", label: "Gallon (gal)" },
  { value: "mL", label: "Millilitre (mL)" },
  { value: "L", label: "Litre (L)" },
  { value: "oz", label: "Ounce (oz)" },
  { value: "lb", label: "Pound (lb)" },
  { value: "g", label: "Gram (g)" },
  { value: "kg", label: "Kilogram (kg)" },
];

export default function Pantry() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.pantry.items);
  const error = useSelector((state) => state.pantry.error);
  const status = useSelector((state) => state.pantry.status);
  const servingPeople = useSelector(
    (state) => state.profile.data?.defaultServingPeople ?? state.profile.form.defaultServingPeople ?? 2
  );
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchPantry());
  }, [dispatch]);

  async function onAdd(event) {
    event.preventDefault();
    try {
      await dispatch(
        addPantryItem({
          name,
          quantity: Number(quantity),
          unit,
          imageUrl: imageUrl || undefined,
        })
      );
      setName("");
      setQuantity("");
      setImageUrl("");
    } catch (_error) {
      // Error is already stored in the pantry slice.
    }
  }

  async function onQtyChange(id, quantityValue) {
    try {
      await dispatch(updatePantryItem(id, { quantity: Number(quantityValue) }));
    } catch (_error) {
      // Error is already stored in the pantry slice.
    }
  }

  async function onRemove(id) {
    try {
      await dispatch(removePantryItem(id));
    } catch (_error) {
      // Error is already stored in the pantry slice.
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <Card>
        <h1 style={{ marginTop: 0 }}>Pantry</h1>
        <p style={{ color: "var(--color-text-soft)", marginTop: 0 }}>
          Serving size for <strong>{servingPeople}</strong> people.
        </p>
        {error ? (
          <p style={{ color: "var(--color-orange)" }} role="alert">
            {error}
          </p>
        ) : null}
        <form
          onSubmit={onAdd}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
            alignItems: "end",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <label>Ingredient</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
          <div>
            <label>Quantity</label>
            <input
              type="number"
              min={0}
              step="any"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
          <div>
            <label>Unit</label>
            <select value={unit} onChange={(event) => setUnit(event.target.value)} style={{ width: "100%", marginTop: 4 }}>
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Saving..." : "Add"}
            </Button>
          </div>
        </form>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {status === "loading" && items.length === 0 ? (
            <p style={{ color: "var(--color-text-soft)" }}>Loading pantry...</p>
          ) : null}
          {items.length === 0 ? <p style={{ color: "var(--color-text-soft)" }}>No ingredients yet.</p> : null}
          {items.map((item) => (
            <div
              key={item._id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: "0.75rem",
                alignItems: "center",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "0.65rem 0.75rem",
                background: "var(--color-beige)",
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                  }}
                  onError={(event) => {
                    event.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: "var(--color-beige-deep)",
                    border: "1px dashed var(--color-border)",
                  }}
                />
              )}
              <div>
                <div style={{ fontWeight: 600, color: "var(--color-brown)" }}>{item.name}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-soft)" }}>{item.unit}</div>
              </div>
              <input
                type="number"
                min={0}
                step="any"
                defaultValue={item.quantity}
                key={item._id + String(item.quantity)}
                onBlur={(event) => onQtyChange(item._id, event.target.value)}
                style={{ width: 88 }}
              />
              <Button type="button" variant="ghost" onClick={() => onRemove(item._id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
