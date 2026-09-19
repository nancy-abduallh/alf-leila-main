import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../providers/cart";
import { useLanguage } from "../providers/language";
import { CartSheet } from "../components/CartSheet";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Sparkles, ShoppingBag, ChevronDown, X, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { t } = useLanguage();
  const location = useLocation();

  const customer = user && user.role !== "admin" ? user : null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background page scrolling while mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isHome = location.pathname === "/";

  const navLinks = [
    { key: "home", href: "/" },
    { key: "menu", href: "/menu" },
    { key: "reserve", href: "/reserve" },
    { key: "story", href: "/story" },
    { key: "contact", href: "/contact" },
  ] as const;

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(href);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50
          transition-all
          duration-500
          ${scrolled || !isHome
            ? "bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-gold-primary/10 shadow-lg shadow-black/10"
            : "bg-transparent"
          }
        `}
      >
        {/* Main Navbar */}
        <div
          className="
            max-w-[1400px]
            mx-auto
            px-4
            sm:px-6
            lg:px-12
            flex
            items-center
            justify-between
            h-[68px]
            lg:h-[72px]
          "
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <Sparkles
              className="
                w-5
                h-5
                text-gold-primary
                transition-transform
                duration-300
                group-hover:rotate-12
              "
            />

            <span
              className="
                font-heading
                text-gold-primary
                text-sm
                tracking-[0.15em]
                font-medium
              "
              style={{ fontStyle: "italic" }}
            >
              ALF LEILA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.href}
                className={`
                  relative
                  text-[13px]
                  font-body
                  font-medium
                  tracking-[0.08em]
                  transition-colors
                  duration-300
                  group
                  ${isActive(link.href)
                    ? "text-gold-primary"
                    : "text-cream/80 hover:text-gold-primary"
                  }
                `}
              >
                {t(`nav.${link.key}`)}

                <span
                  className={`
                    absolute
                    -bottom-1
                    h-[1px]
                    bg-gold-primary
                    transition-all
                    duration-300
                    ${isActive(link.href)
                      ? "left-0 w-full"
                      : "left-1/2 w-0 group-hover:w-full group-hover:left-0"
                    }
                  `}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="
                relative
                p-2
                text-cream/80
                hover:text-gold-primary
                transition-colors
              "
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />

              {totalItems > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    flex
                    items-center
                    justify-center
                    min-w-[18px]
                    h-[18px]
                    px-1
                    rounded-full
                    bg-gold-primary
                    text-table-dark
                    text-[10px]
                    font-bold
                  "
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* User */}
            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="
                    flex
                    items-center
                    gap-2
                    text-cream/80
                    text-sm
                    hover:text-gold-primary
                    transition-colors
                    outline-none
                  "
                >
                  {customer.avatar && (
                    <img
                      src={customer.avatar}
                      alt={customer.name || ""}
                      className="
                        w-8
                        h-8
                        rounded-full
                        border
                        border-gold-primary/30
                      "
                    />
                  )}

                  <span>{customer.name}</span>

                  <ChevronDown className="w-3.5 h-3.5" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48"
                >
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/my-orders">
                      {t("nav.myOrders")}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/my-reservations">
                      {t("nav.myReservations")}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="
                  px-5
                  py-2
                  border
                  border-gold-primary
                  text-gold-primary
                  text-[13px]
                  font-medium
                  tracking-[0.05em]
                  rounded-full
                  hover:bg-gold-primary
                  hover:text-table-dark
                  transition-all
                  duration-300
                "
              >
                {t("nav.signIn")}
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            {/* Language */}
            <div className="scale-90">
              <LanguageSwitcher />
            </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="
                relative
                w-10
                h-10
                flex
                items-center
                justify-center
                rounded-full
                text-cream/90
                hover:text-gold-primary
                hover:bg-gold-primary/10
                transition-all
              "
              aria-label="Open cart"
            >
              <ShoppingBag className="w-[19px] h-[19px]" />

              {totalItems > 0 && (
                <span
                  className="
                    absolute
                    top-0.5
                    right-0.5
                    flex
                    items-center
                    justify-center
                    min-w-[16px]
                    h-[16px]
                    px-1
                    rounded-full
                    bg-gold-primary
                    text-table-dark
                    text-[9px]
                    font-bold
                    border-2
                    border-[#0A0A0F]
                  "
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                rounded-full
                text-cream
                hover:text-gold-primary
                hover:bg-gold-primary/10
                transition-all
              "
              aria-label={
                mobileOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <span className="flex flex-col gap-[5px]">
                  <span className="w-5 h-[1.5px] bg-current" />
                  <span className="w-3.5 h-[1.5px] bg-current ml-auto" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div
          className={`
            lg:hidden
            fixed
            inset-0
            top-[68px]
            z-40
            transition-all
            duration-300
            ${mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
            }
          `}
        >
          {/* Backdrop */}
          <div
            onClick={closeMobileMenu}
            className="
              absolute
              inset-0
              bg-black/60
              backdrop-blur-sm
            "
          />

          {/* Mobile Menu Panel */}
          <div
            className={`
              absolute
              top-0
              right-0
              w-[88%]
              max-w-[380px]
              h-[calc(100vh-68px)]
              overflow-y-auto
              bg-[#0A0A0F]
              border-l
              border-gold-primary/15
              shadow-2xl
              transition-transform
              duration-400
              ${mobileOpen
                ? "translate-x-0"
                : "translate-x-full"
              }
            `}
          >
            {/* Decorative top line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent" />

            <div className="px-6 py-8">
              {/* Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p
                    className="
                      text-gold-primary
                      text-[10px]
                      tracking-[0.25em]
                      uppercase
                      mb-1
                    "
                  >
                    Explore
                  </p>

                  <h2
                    className="
                      font-display
                      text-cream
                      text-2xl
                    "
                  >
                    {t("menu.title")}
                  </h2>
                </div>

                <Sparkles className="w-5 h-5 text-gold-primary/60" />
              </div>

              {/* Main Navigation */}
              <div className="space-y-1">
                {navLinks.map((link, index) => {
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.key}
                      to={link.href}
                      onClick={closeMobileMenu}
                      className={`
                        group
                        flex
                        items-center
                        justify-between
                        w-full
                        px-4
                        py-4
                        rounded-xl
                        transition-all
                        duration-300
                        ${active
                          ? "bg-gold-primary/10 text-gold-primary"
                          : "text-cream/75 hover:bg-white/[0.03] hover:text-gold-primary"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`
                            text-[10px]
                            font-medium
                            tracking-[0.15em]
                            ${active
                              ? "text-gold-primary"
                              : "text-cream/25"
                            }
                          `}
                        >
                          0{index + 1}
                        </span>

                        <span
                          className="
                            text-sm
                            font-medium
                            tracking-[0.08em]
                          "
                        >
                          {t(`nav.${link.key}`)}
                        </span>
                      </div>

                      <ArrowRight
                        className={`
                          w-4
                          h-4
                          transition-all
                          duration-300
                          ${active
                            ? "opacity-100 translate-x-0 text-gold-primary"
                            : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                          }
                        `}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-7 h-px bg-gradient-to-r from-gold-primary/20 via-gold-primary/10 to-transparent" />

              {/* Account Section */}
              {customer ? (
                <div>
                  {/* User Info */}
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-4
                      mb-3
                      rounded-xl
                      bg-white/[0.03]
                      border
                      border-white/[0.06]
                    "
                  >
                    {customer.avatar ? (
                      <img
                        src={customer.avatar}
                        alt={customer.name || ""}
                        className="
                          w-10
                          h-10
                          rounded-full
                          object-cover
                          border
                          border-gold-primary/30
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-10
                          h-10
                          rounded-full
                          bg-gold-primary/10
                          border
                          border-gold-primary/20
                          flex
                          items-center
                          justify-center
                          text-gold-primary
                          text-sm
                          font-medium
                        "
                      >
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-cream text-sm font-medium truncate">
                        {customer.name}
                      </p>

                      <p className="text-cream/35 text-xs mt-0.5">
                        {t("nav.profile")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="
                        block
                        px-4
                        py-3
                        text-sm
                        text-cream/65
                        hover:text-gold-primary
                        rounded-lg
                        hover:bg-white/[0.03]
                        transition-colors
                      "
                    >
                      {t("nav.profile")}
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={closeMobileMenu}
                      className="
                        block
                        px-4
                        py-3
                        text-sm
                        text-cream/65
                        hover:text-gold-primary
                        rounded-lg
                        hover:bg-white/[0.03]
                        transition-colors
                      "
                    >
                      {t("nav.myOrders")}
                    </Link>

                    <Link
                      to="/my-reservations"
                      onClick={closeMobileMenu}
                      className="
                        block
                        px-4
                        py-3
                        text-sm
                        text-cream/65
                        hover:text-gold-primary
                        rounded-lg
                        hover:bg-white/[0.03]
                        transition-colors
                      "
                    >
                      {t("nav.myReservations")}
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        text-sm
                        text-cream/45
                        hover:text-red-400
                        rounded-lg
                        hover:bg-red-400/5
                        transition-colors
                      "
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              ) : (
                /* Guest Account */
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="
                      flex
                      items-center
                      justify-center
                      w-full
                      px-5
                      py-3.5
                      border
                      border-gold-primary/50
                      text-gold-primary
                      text-sm
                      font-medium
                      tracking-[0.05em]
                      rounded-xl
                      hover:bg-gold-primary
                      hover:text-table-dark
                      transition-all
                    "
                  >
                    {t("nav.signIn")}
                  </Link>

                  <Link
                    to="/reserve"
                    onClick={closeMobileMenu}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      w-full
                      px-5
                      py-3.5
                      bg-gold-primary
                      text-table-dark
                      text-sm
                      font-medium
                      tracking-[0.05em]
                      rounded-xl
                      hover:bg-cream
                      transition-all
                    "
                  >
                    {t("nav.reserve")}

                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Bottom Branding */}
              <div className="mt-10 pt-6 border-t border-gold-primary/10">
                <div className="flex items-center justify-center gap-2 text-gold-primary/50">
                  <Sparkles className="w-3.5 h-3.5" />

                  <span
                    className="
                      text-[10px]
                      tracking-[0.3em]
                      uppercase
                    "
                  >
                    Alf Leila
                  </span>

                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                <p className="text-center text-cream/20 text-[10px] mt-2 tracking-wider">
                  An unforgettable dining experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart */}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
      />
    </>
  );
}