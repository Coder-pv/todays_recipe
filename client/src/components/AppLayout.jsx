import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../store/authSlice.js";
import { resetPantry } from "../store/pantrySlice.js";
import { resetPlan } from "../store/planSlice.js";
import { resetProfile } from "../store/profileSlice.js";
import { useDispatch, useSelector } from "../store/redux.js";
import LogoMark from "./LogoMark.jsx";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/pantry", label: "Pantry" },
  { to: "/today", label: "Today's Plan" },
  { to: "/profile", label: "Meal Preference" },
];

function navLinkClass({ isActive }) {
  const base = "app-nav-link";
  return isActive ? `${base} app-nav-link--active` : base;
}

export default function AppLayout() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  function onLogout() {
    dispatch(resetProfile());
    dispatch(resetPantry());
    dispatch(resetPlan());
    dispatch(logout());
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-page)" }}>
      <header
        className="app-header"
        style={{
          background: "var(--color-surface)",
          padding: "1rem 1.25rem 0",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <NavLink
            to="/"
            end
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.65rem",
              marginBottom: "0.85rem",
            }}
          >
            <LogoMark size={44} />
            <span
              className="font-brand"
              style={{ fontSize: "1.35rem", color: "var(--color-brand)", letterSpacing: "-0.02em" }}
            >
              Today&apos;s Recipe
            </span>
          </NavLink>

          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.35rem",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "0.65rem",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.35rem", alignItems: "center" }}>
              {nav.map(({ to, label, end }) => (
                <NavLink key={to} to={to} className={navLinkClass} end={Boolean(end)}>
                  {label}
                </NavLink>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-text-soft)" }}>
              <span>{user?.username || "Signed in"}</span>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  borderRadius: 999,
                  padding: "0.45rem 0.9rem",
                  cursor: "pointer",
                  color: "var(--color-brown)",
                }}
              >
                Log out
              </button>
            </div>
          </nav>
        </div>
        <div
          style={{
            height: 1,
            background: "var(--color-border-subtle)",
            maxWidth: "100%",
          }}
        />
      </header>
      <main style={{ flex: 1, padding: "1.5rem 1.25rem 2.5rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
