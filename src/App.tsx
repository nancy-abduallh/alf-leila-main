import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { trpc } from "./providers/trpc";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Story from "./pages/Story";
import Reserve from "./pages/Reserve";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import MyReservations from "./pages/MyReservations";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import TableScan from "./pages/TableScan";
import TableCheckout from "./pages/TableCheckout";
import OrderPending from "./pages/OrderPending";

function PageViewTracker() {
  const location = useLocation();
  const track = trpc.analytics.track.useMutation();

  useEffect(() => {
    track.mutate({ path: location.pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
}

/**
 * An admin account has no business browsing the storefront as "itself" —
 * every customer action (reserving, ordering, reviewing) belongs to a guest
 * or diner, not to staff. Rather than surface "you're signed in as admin" on
 * every public page and trust each page to refuse to act on it, bounce the
 * admin straight to the dashboard the moment they're on a non-admin route.
 * That keeps the storefront honestly "logged out" for anyone using it, and
 * makes it impossible for an admin session to end up placing a customer
 * order/reservation by accident.
 */
function AdminAwayFromStorefront({ isAdminRoute }: { isAdminRoute: boolean }) {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAdmin && !isAdminRoute) {
      navigate("/admin", { replace: true });
    }
  }, [isLoading, isAdmin, isAdminRoute, navigate]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-table-dark">
      <PageViewTracker />
      <AdminAwayFromStorefront isAdminRoute={isAdminRoute} />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/story" element={<Story />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/table/:code" element={<TableScan />} />
        <Route path="/table-checkout" element={<TableCheckout />} />
        <Route path="/order/pending/:orderId" element={<OrderPending />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      <Toaster />
    </div>
  );
}