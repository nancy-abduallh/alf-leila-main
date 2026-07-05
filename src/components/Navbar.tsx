import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/providers/cart";
import { CartSheet } from "@/components/CartSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Sparkles, ShoppingBag, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const customer = user && user.role !== "admin" ? user : null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "MENU", href: "/menu" },
    { label: "EXPERIENCE", href: "/story" },
    { label: "RESERVE TABLE", href: "/reserve" },
    { label: "STORY", href: "/story" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || !isHome
          ? "bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-gold-primary/10"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-gold-primary transition-transform group-hover:rotate-12" />
            <span
              className="font-heading text-gold-primary text-sm tracking-[0.15em] font-medium"
              style={{ fontStyle: "italic" }}
            >
              ALF LEILA
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="relative text-cream/80 text-[13px] font-body font-medium tracking-[0.08em] hover:text-gold-primary transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-gold-primary transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-cream/80 hover:text-gold-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold-primary text-table-dark text-[10px] font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-cream/80 text-sm hover:text-gold-primary transition-colors outline-none">
                  {customer.avatar && (
                    <img
                      src={customer.avatar}
                      alt={customer.name || ""}
                      className="w-8 h-8 rounded-full border border-gold-primary/30"
                    />
                  )}
                  <span>{customer.name}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-reservations">My Reservations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 border border-gold-primary text-gold-primary text-[13px] font-medium tracking-[0.05em] rounded-full hover:bg-gold-primary hover:text-table-dark transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-cream"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-gold-primary text-table-dark text-[9px] font-bold">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="text-cream p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-gold-primary/10">
            <div className="flex flex-col items-center gap-6 py-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-cream/80 text-sm font-medium tracking-[0.08em] hover:text-gold-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {customer ? (
                <>
                  <Link to="/profile" className="text-cream/80 text-sm hover:text-gold-primary transition-colors">
                    Profile
                  </Link>
                  <Link to="/my-orders" className="text-cream/80 text-sm hover:text-gold-primary transition-colors">
                    My Orders
                  </Link>
                  <Link to="/my-reservations" className="text-cream/80 text-sm hover:text-gold-primary transition-colors">
                    My Reservations
                  </Link>
                  <button
                    onClick={logout}
                    className="text-cream/60 text-sm hover:text-gold-primary transition-colors"
                  >
                    Logout ({customer.name})
                  </button>
                </>
              ) : (
                <Link
                  to="/reserve"
                  className="px-6 py-2 border border-gold-primary text-gold-primary text-sm rounded-full hover:bg-gold-primary hover:text-table-dark transition-all"
                >
                  Reserve a Table
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}