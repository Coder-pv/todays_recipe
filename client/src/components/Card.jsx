export default function Card({ children, style, ...rest }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 12,
        padding: "1.25rem",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
