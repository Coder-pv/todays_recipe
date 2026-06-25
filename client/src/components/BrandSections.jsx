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
    <section className="brand-hero" aria-label="RecipeBook home banner">
      <div className="brand-hero__content" aria-hidden="true" />
    </section>
  );
}

export function UserReviewsSection() {
  return (
    <section className="reviews-section">
      <h2 className="font-sans-heading reviews-title">
        Hear from our Users
      </h2>
      <div className="reviews-grid">
        {reviews.map((r, i) => (
          <article key={i} className="review-card">
            <StarRow />
            <h3 className="font-sans-heading">
              {r.title}
            </h3>
            <p>{r.body}</p>
            <div className="review-author">
              <div className="review-avatar" aria-hidden />
              <div>
                <div className="review-author__name">{r.name}</div>
                <div className="review-author__date">{r.date}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
