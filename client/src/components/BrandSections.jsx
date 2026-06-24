const reviews = [
  {
    title: "Finally, plans that stick",
    body: "The dashboard and pantry sync made it easy to hit my calorie goals .",
    name: "Alex M.",
    date: "Mar 2026",
  },
  {
    title: "Love the daily flow",
    body: "Breakfast through dinner suggestions feel balanced.",
    name: "Jordan K.",
    date: "Feb 2026",
  },
  {
    title: "Simple and motivating",
    body: "Now I can easily cook the meals with items from my pantry personalised suggestions.",
    name: "Sam R.",
    date: "Jan 2026",
  },
];

function StarRow() {
  return (
    <div className="review-stars" aria-label="5 out of 5 stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2.5l2.8 6.9h7.4l-6 4.6 2.3 7-6.5-4.7-6.5 4.7 2.3-7-6-4.6h7.4L12 2.5z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export function BrandHero() {
  return (
    <section className="brand-hero" aria-label="recipeBook home banner">
      <div className="brand-hero__content" aria-hidden="true" />
    </section>
  );
}

export function UserReviewsSection() {
  return (
    <section style={{ marginBottom: "1.75rem" }}>
      <h2
        className="font-sans-heading"
        style={{
          margin: "0 0 1.25rem",
          fontSize: "1.35rem",
          fontWeight: 700,
          color: "var(--color-text-heading)",
        }}
      >
        Hear from our Users
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {reviews.map((r, i) => (
          <article
            key={i}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            <StarRow />
            <h3
              className="font-sans-heading"
              style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 700, color: "var(--color-text-heading)" }}
            >
              {r.title}
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
              {r.body}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-brand-soft) 0%, var(--color-brand) 100%)",
                  flexShrink: 0,
                }}
                aria-hidden
              />
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-heading)" }}>{r.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{r.date}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
