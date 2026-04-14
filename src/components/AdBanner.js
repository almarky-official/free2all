export function AdBanner({ label = "AdSense Ready", compact = false }) {
  return (
    <aside className={`ad-banner glass-panel ${compact ? "is-compact" : ""}`} aria-label={label}>
      <span className="ad-label">Ad Space</span>
      <strong>{label}</strong>
      <span className="ad-copy">Clean placement reserved for monetization without breaking the layout.</span>
    </aside>
  );
}
