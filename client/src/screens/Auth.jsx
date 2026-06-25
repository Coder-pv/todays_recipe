import { Navigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { login, register, setAuthMode } from "../store/authSlice.js";
import { useDispatch, useSelector } from "../store/redux.js";
import { useState } from "react";

export default function Auth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: "", password: "" });

  if (auth.status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    try {
      await dispatch(auth.mode === "register" ? register(form) : login(form));
    } catch (_error) {
      // Error is already stored in the auth slice.
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h1>
          {auth.mode === "register" ? "Create your account" : "Sign in"}
        </h1>
        <p className="auth-card__subtitle">
          Enter your User name and password
        </p>
        <form onSubmit={onSubmit} className="auth-form">
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete={auth.mode === "register" ? "new-password" : "current-password"}
              required
            />
          </div>
          <Button type="submit" disabled={auth.status === "loading"}>
            {auth.status === "loading"
              ? "Please wait..."
              : auth.mode === "register"
                ? "Create account"
                : "Sign in"}
          </Button>
          {auth.error ? (
            <p role="alert" className="auth-error">
              {auth.error}
            </p>
          ) : null}
        </form>
        <div className="auth-switch">
          {auth.mode === "register" ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => dispatch(setAuthMode(auth.mode === "register" ? "login" : "register"))}
          >
            {auth.mode === "register" ? "Sign in" : "Create an account"}
          </button>
        </div>
      </Card>
    </div>
  );
}
