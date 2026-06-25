import { useState } from "react";
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
  { to: "/today", label: "Today's Recipe" },
  { to: "/profile", label: "Meal Preference" },
];

function navLinkClass({ isActive }) {
  const base = "app-nav-link";
  return isActive ? `${base} app-nav-link--active` : base;
}

export default function AppLayout() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

  function onLogout() {
    setMenuOpen(false);
    dispatch(resetProfile());
    dispatch(resetPantry());
    dispatch(resetPlan());
    dispatch(logout());
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand-row">
            <NavLink to="/" end className="app-brand" onClick={() => setMenuOpen(false)}>
              <LogoMark size={44} />
              <span className="font-brand">RecipeBook</span>
            </NavLink>
          </div>

          <nav id="app-navigation" className={`app-nav ${menuOpen ? "app-nav--open" : ""}`}>
            <div className="app-nav__links">
              {nav.map(({ to, label, end }) => (
                <NavLink key={to} to={to} className={navLinkClass} end={Boolean(end)} onClick={() => setMenuOpen(false)}>
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="app-header__actions">
            <span className="app-user-name">{user?.username || "Signed in"}</span>
            <button type="button" onClick={onLogout} className="logout-button app-header__logout">
              Sign out
            </button>
            <button
              type="button"
              className={`mobile-menu-button ${menuOpen ? "mobile-menu-button--open" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="app-navigation"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
