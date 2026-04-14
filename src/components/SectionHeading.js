export function SectionHeading({ eyebrow, title, description, align = "left", as: HeadingTag = "h2" }) {
  return (
    <div className={`section-heading ${align === "center" ? "is-center" : ""}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <HeadingTag>{title}</HeadingTag>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
