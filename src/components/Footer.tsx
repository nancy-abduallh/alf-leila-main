import { Link } from "react-router";
import { Sparkles, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "../providers/language";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-table-dark border-t border-gold-primary/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gold-primary" />
              <span
                className="font-heading text-gold-primary text-sm tracking-[0.15em]"
                style={{ fontStyle: "italic" }}
              >
                ALF LEILA WA LEILA
              </span>
            </div>
            <p className="text-cream/50 text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-heading text-gold-primary text-sm tracking-[0.1em] mb-4">
              {t("footer.quickLinks")}
            </h4>
            <div className="flex flex-col gap-2.5">
              {["Menu", "Reservations", "Private Events", "Gift Cards", "Careers"].map(
                (link) => (
                  <Link
                    key={link}
                    to={link === "Menu" ? "/menu" : link === "Reservations" ? "/reserve" : "/"}
                    className="text-cream/50 text-sm hover:text-gold-primary transition-colors duration-300"
                  >
                    {link}
                  </Link>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-gold-primary text-sm tracking-[0.1em] mb-4">
              {t("footer.hours")}
            </h4>
            <div className="flex flex-col gap-2.5 text-cream/50 text-sm">
              <p>Sunday – Thursday: 12PM – 11PM</p>
              <p>Friday – Saturday: 1PM – 12AM</p>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-gold-primary text-sm tracking-[0.1em] mb-4">
              {t("footer.contact")}
            </h4>
            <div className="flex flex-col gap-2.5 text-cream/50 text-sm">
              <p>12 Talaat Harb St, Downtown Cairo</p>
              <p>+20 2 2574 8932</p>
              <p>hello@alfleila.com</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="mt-12 pt-8 border-t border-gold-primary/10 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-cream/30 text-xs">
                &copy; 2026 Alf Leila wa Leila. All rights reserved.
              </p>

              <p className="text-cream/30 text-xs">
                Developed with{" "}
                <span className="text-red-500">&#10084;</span>{" "}
                by{" "}

                <a href="https://nancy-abduallh-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream hover:text-gold transition-colors duration-300 hover:underline underline-offset-4"
                >
                  Nancy Abduallh
                </a>
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Social icons */}
            </div>
          </div>
          <div className="flex items-center gap-4">

            <a href="#"
              className="text-gold-dark hover:text-gold-primary transition-colors duration-300"
              onClick={(e) => e.preventDefault()}
            >
              <Instagram className="w-5 h-5" />
            </a>

            <a href="#"
              className="text-gold-dark hover:text-gold-primary transition-colors duration-300"
              onClick={(e) => e.preventDefault()}
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div >
      </div >
    </footer >
  );
}