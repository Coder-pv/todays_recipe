export default function Button({ children, variant = "primary", ...props }) {
  const base = {
    fontFamily: "inherit",
    fontSize: "0.9rem",
    padding: "0.5rem 1rem",
    borderRadius: 8,
    cursor: props.disabled ? "not-allowed" : "pointer",
    borderWidth: 2,
    borderStyle: "solid",
    opacity: props.disabled ? 0.55 : 1,
  };
  const styles =
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
    <button type="button" style={styles} {...props}>
      {children}
    </button>
  );
}
