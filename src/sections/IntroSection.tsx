import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../providers/language";

gsap.registerPlugin(ScrollTrigger);

export default function IntroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const leftItems = section.querySelectorAll(".left-reveal");
      const rightItems = section.querySelectorAll(".right-reveal");

      gsap.fromTo(
        leftItems,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        rightItems,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
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
      className="bg-table-dark py-24 lg:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-2">
            <p className="left-reveal font-heading text-gold-primary text-sm tracking-[0.15em] mb-4" style={{ fontStyle: "italic" }}>
              {t("intro.eyebrow")}
            </p>
            <h2 className="left-reveal font-display text-cream text-[clamp(1.8rem,3vw,2.8rem)] leading-tight mb-6">
              {t("intro.title")}
            </h2>
            <div className="left-reveal space-y-4 mb-8">
              <p className="text-cream/60 leading-relaxed">
                {t("intro.paragraph1")}
              </p>
              <p className="text-cream/60 leading-relaxed">
                {t("intro.paragraph2")}
              </p>
            </div>
            <Link
              to="/menu"
              className="left-reveal inline-flex items-center gap-2 text-gold-primary text-sm font-medium tracking-[0.05em] group relative"
            >
              {t("intro.cta")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>

          <div className="lg:col-span-3">
            <div className="right-reveal relative">
              <div className="absolute -inset-3 border-2 border-gold-dark/50 rounded-sm" />
              <div className="absolute -inset-1 border border-gold-primary/40 rounded-sm" />
              <img
                src="/restaurant-interior.jpg"
                alt="Alf Leila wa Leila Restaurant Interior"
                className="relative w-full h-auto object-cover rounded-sm"
                style={{ boxShadow: "0 30px 60px rgba(0, 0, 0, 0.5)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}