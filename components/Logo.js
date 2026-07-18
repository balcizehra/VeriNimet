export function Logo({ size = 24 }) {
  return (
    <img
      src="/logo-header.png"
      alt="Genç İHH"
      width={size}
      height={size}
      style={{ borderRadius: 6, objectFit: "contain", display: "block" }}
    />
  );
}