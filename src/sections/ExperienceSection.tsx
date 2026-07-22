import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router";
import { useLanguage } from "../providers/language";

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const ctx = gsap.context(() => {
      // Parallax background
      gsap.to(bg, {
        backgroundPositionY: "70%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      const items = section.querySelectorAll(".exp-reveal");
      gsap.fromTo(
        items,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/restaurant-atmosphere.jpg)",
          backgroundPositionY: "30%",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/70 via-[#0A0A0F]/60 to-[#0A0A0F]/90" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto py-24">
        <h2 className="exp-reveal font-display text-cream text-[clamp(2rem,5vw,4rem)] leading-none mb-6">
          {t("experience.title")}
        </h2>
        <p className="exp-reveal text-cream/60 text-base lg:text-lg leading-relaxed mb-8">
          {t("experience.description")}
        </p>
        <Link
          to="/reserve"
          className="exp-reveal inline-flex items-center gap-2 px-8 py-3 bg-gold-primary text-table-dark font-medium text-sm tracking-[0.05em] rounded-full hover:bg-cream hover:shadow-gold transition-all duration-300"
        >
          {t("experience.cta")}
        </Link>
      </div>
    </section>
  );
}