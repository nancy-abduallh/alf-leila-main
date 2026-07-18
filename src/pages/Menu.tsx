import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { trpc } from "../providers/trpc";
import { useCart } from "../providers/cart";
import { useLanguage } from "../providers/language";
import { Search, SlidersHorizontal, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

type Category = "all" | "appetizer" | "main" | "dessert" | "beverage" | "breakfast";
type Subcategory = "all" | "coffee" | "tea" | "others";

const categoryOrder: Category[] = ["all", "main", "appetizer", "dessert", "beverage", "breakfast"];
const subcategoryOrder: Subcategory[] = ["all", "coffee", "tea", "others"];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activeSubcategory, setActiveSubcategory] = useState<Subcategory>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { t } = useLanguage();

  // Subcategory filter only makes sense inside Beverages; reset it whenever
  // the person leaves that category so it doesn't silently stay applied.
  useEffect(() => {
    if (activeCategory !== "beverage") {
      setActiveSubcategory("all");
    }
  }, [activeCategory]);

  const {
    data: allDishes,
    isLoading,
    isError,
    error,
  } = trpc.dish.list.useQuery(
    activeCategory !== "all"
      ? {
        category: activeCategory,
        ...(activeCategory === "beverage" && activeSubcategory !== "all"
          ? { subcategory: activeSubcategory }
          : {}),
      }
      : undefined,
  );

  const filteredDishes = allDishes?.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll(".menu-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [filteredDishes]);

  const handleAddToCart = (dish: NonNullable<typeof allDishes>[number]) => {
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
    });
    toast.success(`${dish.name} ${t("menu.addedToCart")}`);
  };

  return (
    <main className="bg-table-dark min-h-screen pt-[72px]">
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src="/restaurant-atmosphere.jpg"
          alt="Restaurant atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/70 via-[#0A0A0F]/50 to-[#0A0A0F]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="font-heading text-gold-primary text-sm tracking-[0.2em] mb-3" style={{ fontStyle: "italic" }}>
            {t("menu.eyebrow")}
          </p>
          <h1 className="font-display text-cream text-[clamp(2.5rem,5vw,4rem)]">{t("menu.title")}</h1>
          <div className="w-16 h-[1px] bg-gold-primary mt-4" />
        </div>
      </div>

      <div ref={sectionRef} className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categoryOrder.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium tracking-[0.05em] rounded-full whitespace-nowrap transition-all duration-300 ${activeCategory === cat
                  ? "bg-gold-primary text-table-dark"
                  : "border border-gold-primary/30 text-cream/70 hover:border-gold-primary hover:text-gold-primary"
                  }`}
              >
                {t(`menu.categories.${cat}`)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
            <input
              type="text"
              placeholder={t("menu.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-table-mid border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors"
            />
          </div>
        </div>

        {activeCategory === "beverage" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 -mt-2">
            {subcategoryOrder.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`px-3.5 py-1.5 text-xs font-medium tracking-[0.05em] rounded-full whitespace-nowrap transition-all duration-300 ${activeSubcategory === sub
                  ? "bg-gold-primary/20 text-gold-primary border border-gold-primary"
                  : "border border-gold-primary/15 text-cream/50 hover:border-gold-primary/50 hover:text-cream/80"
                  }`}
              >
                {t(`menu.subcategories.${sub}`)}
              </button>
            ))}
          </div>
        )}

        {!(activeCategory === "beverage") && <div className="mb-10" />}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-table-mid rounded-lg h-80" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 max-w-lg mx-auto">
            <AlertTriangle className="w-10 h-10 text-red-400/70 mx-auto mb-4" />
            <p className="text-cream/70 text-lg">{t("menu.couldNotLoad")}</p>
            <p className="text-cream/40 text-sm mt-2 break-words">
              {error?.message || "Unknown error contacting the server."}
            </p>
            <p className="text-cream/30 text-xs mt-4">{t("menu.healthCheckHint")}</p>
          </div>
        ) : filteredDishes && filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => {
              const outOfStock = dish.stock !== null && dish.stock <= 0;
              return (
                <div
                  key={dish.id}
                  className="menu-card group bg-[rgba(20,20,27,0.85)] backdrop-blur-lg border border-gold-primary/15 rounded overflow-hidden transition-all duration-500 hover:border-gold-primary hover:shadow-gold"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={dish.imageUrl || "/hero-food-molokhia.jpg"}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-cream text-lg group-hover:text-gold-primary transition-colors">
                        {dish.name}
                      </h3>
                      <span
                        className="font-heading text-gold-primary text-sm whitespace-nowrap"
                        style={{ fontStyle: "italic" }}
                      >
                        {dish.price} EGP
                      </span>
                    </div>
                    <p className="text-cream/50 text-sm leading-relaxed mb-4">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-3 py-1 text-xs text-gold-primary/70 border border-gold-primary/20 rounded-full capitalize">
                          {t(`menu.categories.${dish.category}`)}
                        </span>
                        {dish.category === "beverage" && dish.subcategory && (
                          <span className="px-3 py-1 text-xs text-cream/60 border border-cream/15 rounded-full">
                            {t(`menu.subcategories.${dish.subcategory}`)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(dish)}
                        disabled={outOfStock}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${outOfStock
                          ? "bg-cream/10 text-cream/30 cursor-not-allowed"
                          : "bg-gold-primary text-table-dark hover:bg-cream"
                          }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {outOfStock ? t("menu.outOfStock") : t("menu.add")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <SlidersHorizontal className="w-10 h-10 text-gold-primary/30 mx-auto mb-4" />
            <p className="text-cream/50 text-lg">{t("menu.noResults")}</p>
            <p className="text-cream/30 text-sm mt-1">{t("menu.adjustFilters")}</p>
          </div>
        )}
      </div>
    </main>
  );
}