import { Link } from "react-router-dom";

const base = {
  display: "inline-block",
  fontFamily: "inherit",
  fontSize: "0.9rem",
  padding: "0.5rem 1rem",
  borderRadius: 8,
  textDecoration: "none",
  borderWidth: 2,
  borderStyle: "solid",
};

export default function NavButton({ to, children, variant = "primary" }) {
  const style =
    variant === "ghost"
      ? {
          ...base,
          background: "transparent",
          color: "var(--color-brand)",
          borderColor: "var(--color-brand)",
        }
      : {
          ...base,
          background: "var(--color-brand)",
          color: "#fff",
          borderColor: "var(--color-brand)",
        };

  return (
    <Link to={to} style={style}>
      {children}
    </Link>
  );
}
