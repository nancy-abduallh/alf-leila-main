import HeroVideoSection from "@/sections/HeroVideoSection";
import IntroSection from "@/sections/IntroSection";
import SignatureDishesSection from "@/sections/SignatureDishesSection";
import ExperienceSection from "@/sections/ExperienceSection";
import ReviewsSection from "@/sections/ReviewsSection";

export default function Home() {
  return (
    <main className="bg-table-dark">
      <HeroVideoSection />
      <IntroSection />
      <SignatureDishesSection />
      <ExperienceSection />
      <ReviewsSection />
    </main>
  );
}