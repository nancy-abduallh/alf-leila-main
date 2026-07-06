import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";

gsap.registerPlugin(ScrollTrigger);

function DishCard({
  dish,
  index,
}: {
  dish: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
  };
  index: number;
}) {
  return (
    <div
      className="dish-card group bg-[rgba(20,20,27,0.85)] backdrop-blur-lg border border-gold-primary/20 rounded overflow-hidden transition-all duration-500 hover:border-gold-primary hover:shadow-gold"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={dish.imageUrl || "/hero-food-molokhia.jpg"}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-cream text-lg mb-2 group-hover:text-gold-primary transition-colors">
          {dish.name}
        </h3>
        <p className="text-cream/50 text-sm leading-relaxed mb-3 line-clamp-2">
          {dish.description}
        </p>
        <p className="font-heading text-gold-primary text-base" style={{ fontStyle: "italic" }}>
          {dish.price} EGP
        </p>
      </div>
    </div>
  );
}

export default function SignatureDishesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: dishes, isLoading, isError, error } = trpc.dish.featured.useQuery();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll(".dish-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [dishes]);

  return (
    <section ref={sectionRef} className="bg-table-mid py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="font-heading text-gold-primary text-sm tracking-[0.15em] mb-3" style={{ fontStyle: "italic" }}>
            OUR BEST
          </p>
          <h2 className="font-display text-cream text-[clamp(1.8rem,3vw,2.8rem)]">
            Signature Creations
          </h2>
          <div className="w-16 h-[1px] bg-gold-primary mx-auto mt-4" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-table-dark rounded h-80" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-red-400/80 text-center max-w-md mx-auto text-sm">
            Couldn&apos;t load dishes: {error?.message || "unknown error"}. Check
            /api/health and your DATABASE_URL configuration.
          </p>
        ) : dishes && dishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishes.map((dish, i) => (
              <DishCard key={dish.id} dish={dish} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-cream/40 text-center">
            No signature dishes yet — add some from the admin dashboard.
          </p>
        )}

        <div className="text-center mt-12">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold-primary text-gold-primary text-sm font-medium tracking-[0.05em] rounded-full hover:bg-gold-primary hover:text-table-dark transition-all duration-300"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}