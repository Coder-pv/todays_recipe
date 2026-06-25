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

  function onLogout() {
    dispatch(resetProfile());
    dispatch(resetPantry());
    dispatch(resetPlan());
    dispatch(logout());
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <NavLink
            to="/"
            end
            className="app-brand"
          >
            <LogoMark size={44} />
            <span className="font-brand">
              RecipeBook
            </span>
          </NavLink>

          <nav className="app-nav">
            <div className="app-nav__links">
              {nav.map(({ to, label, end }) => (
                <NavLink key={to} to={to} className={navLinkClass} end={Boolean(end)}>
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="app-session">
              <span>{user?.username || "Signed in"}</span>
              <button
                type="button"
                onClick={onLogout}
                className="logout-button"
              >
                Log out
              </button>
            </div>
          </nav>
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
