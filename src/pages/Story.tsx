import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, MapPin, Award, Users } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const timelineEvents = [
  {
    year: "1987",
    title: "The Beginning",
    description:
      "Alf Leila wa Leila opened its doors on a quiet corner of Talaat Harb Street. Founded by Chef Hassan El-Masry, the restaurant began as a modest 12-table establishment serving traditional family recipes.",
  },
  {
    year: "1995",
    title: "A Growing Reputation",
    description:
      "After being featured in Cairo's top food guide, the restaurant expanded to accommodate 50 guests. Chef Hassan introduced his signature Molokhia Royale, which remains our most celebrated dish.",
  },
  {
    year: "2008",
    title: "The New Generation",
    description:
      "Chef Amira El-Masry, Hassan's daughter, returned from Le Cordon Bleu Paris to join the kitchen. She brought modern techniques while honoring the traditional flavors that made Alf Leila famous.",
  },
  {
    year: "2019",
    title: "Renovation & Revival",
    description:
      "A complete renovation transformed the space into the atmospheric dining room guests experience today — inspired by the palaces of old Cairo, with brass lanterns and intricate geometric patterns.",
  },
  {
    year: "2024",
    title: "Looking Forward",
    description:
      "Today, Alf Leila wa Leila continues to be Cairo's premier destination for authentic Egyptian cuisine, welcoming guests from around the world to experience a thousand and one nights of flavor.",
  },
];

const stats = [
  { icon: Clock, label: "Years of Excellence", value: "37+" },
  { icon: Users, label: "Happy Guests", value: "500K+" },
  { icon: Award, label: "Awards Won", value: "28" },
  { icon: MapPin, label: "Location", value: "Downtown" },
];

export default function Story() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
            OUR JOURNEY
          </p>
          <h1 className="font-display text-cream text-[clamp(2.5rem,5vw,4rem)]">
            Our Story
          </h1>
          <div className="w-16 h-[1px] bg-gold-primary mt-4" />
        </div>
      </div>

      <div ref={sectionRef} className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="story-reveal font-display text-cream text-[clamp(1.5rem,3vw,2.2rem)] mb-6">
            A Legacy of Flavor Since 1987
          </h2>
          <p className="story-reveal text-cream/60 text-base leading-relaxed">
            For over three decades, Alf Leila wa Leila has been more than a restaurant —
            it has been a guardian of Egyptian culinary heritage. Our story is one of family,
            tradition, and an unwavering commitment to the art of Egyptian hospitality.
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
              PHILOSOPHY
            </p>
            <h3 className="font-display text-cream text-2xl lg:text-3xl mb-4">
              Honoring Tradition, Embracing Innovation
            </h3>
            <p className="text-cream/60 text-sm leading-relaxed mb-4">
              At Alf Leila wa Leila, we believe that the best Egyptian cuisine comes from
              understanding the past while fearlessly exploring the future. Our chefs spend
              years mastering traditional techniques before they are encouraged to innovate.
            </p>
            <p className="text-cream/60 text-sm leading-relaxed">
              Every ingredient is carefully sourced — from the molokhia leaves picked at
              dawn in the Nile Delta to the spices ground fresh in our kitchen. This
              dedication to quality is what has made us Cairo&apos;s most beloved restaurant
              for over three decades.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
