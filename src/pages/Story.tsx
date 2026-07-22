import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, MapPin, Award, Users } from "lucide-react";
import { useLanguage } from "../providers/language";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const timelineEvents = t("story.timeline") as unknown as {
    year: string;
    title: string;
    description: string;
  }[];

  const stats = [
    { icon: Clock, label: t("story.statYears"), value: "37+" },
    { icon: Users, label: t("story.statGuests"), value: "500K+" },
    { icon: Award, label: t("story.statAwards"), value: "28" },
    { icon: MapPin, label: t("story.statLocation"), value: t("story.locationValue") },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const reveals = section.querySelectorAll(".story-reveal");
      gsap.fromTo(
        reveals,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );

      const timelineItems = section.querySelectorAll(".timeline-item");
      timelineItems.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-table-dark min-h-screen pt-[72px]">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img
          src="/restaurant-interior.jpg"
          alt="Restaurant interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/70 via-[#0A0A0F]/50 to-[#0A0A0F]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="font-heading text-gold-primary text-sm tracking-[0.2em] mb-3" style={{ fontStyle: "italic" }}>
            {t("story.eyebrow")}
          </p>
          <h1 className="font-display text-cream text-[clamp(2.5rem,5vw,4rem)]">
            {t("story.title")}
          </h1>
          <div className="w-16 h-[1px] bg-gold-primary mt-4" />
        </div>
      </div>

      <div ref={sectionRef} className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="story-reveal font-display text-cream text-[clamp(1.5rem,3vw,2.2rem)] mb-6">
            {t("story.introTitle")}
          </h2>
          <p className="story-reveal text-cream/60 text-base leading-relaxed">
            {t("story.introText")}
          </p>
        </div>

        {/* Stats */}
        <div className="story-reveal grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-table-mid border border-gold-primary/10 rounded-lg"
            >
              <stat.icon className="w-6 h-6 text-gold-primary mx-auto mb-3" />
              <p className="font-display text-gold-primary text-2xl lg:text-3xl mb-1">
                {stat.value}
              </p>
              <p className="text-cream/50 text-xs tracking-[0.05em]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-[1px] bg-gold-primary/20 lg:-translate-x-[0.5px]" />

          {timelineEvents.map((event, index) => (
            <div
              key={event.year}
              className={`timeline-item relative pl-12 lg:pl-0 mb-12 last:mb-0 ${index % 2 === 0
                ? "lg:pr-[calc(50%+4rem)] lg:text-right"
                : "lg:pl-[calc(50%+4rem)]"
                }`}
            >
              <div
                className="absolute left-2 lg:left-1/2 w-5 h-5 rounded-full border-2 border-gold-primary bg-table-dark -translate-x-[9px] top-1 z-10"
              />
              <span className="font-display text-gold-primary text-xl mb-2 block">
                {event.year}
              </span>
              <h3 className="font-display text-cream text-lg mb-2">{event.title}</h3>
              <p className="text-cream/50 text-sm leading-relaxed max-w-md lg:max-w-none">
                {event.description}
              </p>
            </div>
          ))}
        </div>

        {/* Philosophy */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/hero-food-hamam.jpg"
              alt="Our cuisine"
              className="rounded-lg w-full"
              style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
            />
          </div>
          <div>
            <p className="font-heading text-gold-primary text-sm tracking-[0.15em] mb-3" style={{ fontStyle: "italic" }}>
              {t("story.philosophyLabel")}
            </p>
            <h3 className="font-display text-cream text-2xl lg:text-3xl mb-4">
              {t("story.philosophyTitle")}
            </h3>
            <p className="text-cream/60 text-sm leading-relaxed mb-4">
              {t("story.philosophyText1")}
            </p>
            <p className="text-cream/60 text-sm leading-relaxed">
              {t("story.philosophyText2")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}