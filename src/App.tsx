import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { trpc } from "@/providers/trpc";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Story from "./pages/Story";
import Reserve from "./pages/Reserve";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import OrderComplete from "./pages/OrderComplete";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import MyReservations from "./pages/MyReservations";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

function PageViewTracker() {
  const location = useLocation();
  const track = trpc.analytics.track.useMutation();

  useEffect(() => {
    track.mutate({ path: location.pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
}

//favicon


export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-table-dark">
      <PageViewTracker />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/story" element={<Story />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/complete" element={<OrderComplete />} />
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