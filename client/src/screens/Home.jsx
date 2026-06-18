import { BrandHero, UserReviewsSection } from "../components/BrandSections.jsx";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <BrandHero />
      <UserReviewsSection />
    </div>
  );
}
