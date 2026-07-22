import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../providers/language";

gsap.registerPlugin(ScrollTrigger);

export default function HeroVideoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const elements = content.querySelectorAll(".reveal-item");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
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
      className="relative w-full h-screen overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-dish-assembly.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-[#0A0A0F]/40 to-[#0A0A0F]/90" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
      >
        <p
          className="reveal-item font-heading text-gold-primary text-sm tracking-[0.2em] mb-4"
          style={{ fontStyle: "italic" }}
        >
          {t("hero.eyebrow")}
        </p>
        <h1 className="reveal-item font-display text-cream text-[clamp(2.5rem,7vw,6rem)] leading-none tracking-[-0.02em] max-w-4xl">
          {t("hero.titleLine1")}
          <span className="gold-shimmer block mt-2">{t("hero.titleHighlight")}</span>
        </h1>
        <p className="reveal-item text-cream/60 text-base lg:text-lg max-w-xl mt-6 leading-relaxed font-body">
          {t("hero.description")}
        </p>
        <Link
          to="/menu"
          className="reveal-item mt-8 px-8 py-3 bg-gold-primary text-table-dark font-medium text-sm tracking-[0.05em] rounded-full hover:bg-cream hover:shadow-gold transition-all duration-300 inline-flex items-center gap-2"
        >
          {t("hero.cta")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}