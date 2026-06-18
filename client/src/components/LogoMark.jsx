export default function LogoMark({ size = 40 }) {
  return (
    <img
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      style={{
        display: "block",
        width: size,
        height: size,
        objectFit: "contain",
      }}
      aria-hidden="true"
    />
  );
}
