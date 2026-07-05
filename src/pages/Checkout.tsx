import { useState } from "react";
import { useNavigate } from "react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/providers/cart";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function Checkout() {
    const { user, isLoading: authLoading } = useAuth();
    const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [notes, setNotes] = useState("");

    const createOrder = trpc.order.create.useMutation({
        onSuccess: (data) => {
            clear();
            window.location.href = data.iframeUrl;
        },
        onError: (err) => toast.error(err.message),
    });

    if (authLoading) {
        return (
            <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    if (!user) {
        return (
            <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center px-6">
                <div className="text-center max-w-sm">
                    <h1 className="font-display text-cream text-2xl mb-3">Sign in to checkout</h1>
                    <p className="text-cream/50 text-sm mb-6">
                        Please sign in or create an account to place your order.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-2.5 bg-gold-primary text-table-dark text-sm font-medium rounded-full hover:bg-cream transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="px-6 py-2.5 border border-gold-primary text-gold-primary text-sm font-medium rounded-full hover:bg-gold-primary hover:text-table-dark transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="bg-table-dark min-h-screen pt-[72px] flex flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="w-12 h-12 text-gold-primary/40 mb-4" />
                <h1 className="font-display text-cream text-2xl mb-2">Your cart is empty</h1>
                <p className="text-cream/50 text-sm mb-6">Add some dishes from the menu first.</p>
                <button
                    onClick={() => navigate("/menu")}
                    className="px-6 py-2.5 bg-gold-primary text-table-dark text-sm font-medium rounded-full hover:bg-cream transition-colors"
                >
                    Browse Menu
                </button>
            </main>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim() || !address.trim() || !city.trim()) {
            toast.error("Please fill in all required delivery details");
            return;
        }
        createOrder.mutate({
            items: items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
            phone,
            address,
            city,
            notes: notes || undefined,
        });
    };

    return (
        <main className="bg-table-dark min-h-screen pt-[72px]">
            <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <h1 className="font-display text-cream text-2xl lg:text-3xl mb-8">Checkout</h1>

                <div className="space-y-4 mb-8">
                    {items.map((item) => (
                        <div
                            key={item.dishId}
                            className="flex gap-4 bg-table-mid border border-gold-primary/10 rounded-lg p-4"
                        >
                            <img
                                src={item.imageUrl || "/hero-food-molokhia.jpg"}
                                alt={item.name}
                                className="w-20 h-20 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-cream font-medium">{item.name}</p>
                                    <p className="text-gold-primary text-sm whitespace-nowrap">
                                        {(parseFloat(item.price) * item.quantity).toFixed(2)} EGP
                                    </p>
                                </div>
                                <p className="text-cream/40 text-xs mb-2">{item.price} EGP each</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                                        className="p-1.5 rounded border border-gold-primary/20 hover:bg-gold-primary/10 text-cream/70"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-cream text-sm w-6 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                                        className="p-1.5 rounded border border-gold-primary/20 hover:bg-gold-primary/10 text-cream/70"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => removeItem(item.dishId)}
                                        className="ml-auto p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between border-t border-gold-primary/10 pt-4 mb-8">
                    <span className="text-cream/70">Total</span>
                    <span className="text-gold-primary text-xl font-display">
                        {totalPrice.toFixed(2)} EGP
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-table-mid border border-gold-primary/10 rounded-lg p-5">
                        <h2 className="text-cream font-display text-lg mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-cream/60 text-sm mb-1.5 block">Name</label>
                                <input
                                    type="text"
                                    disabled
                                    value={user.name || ""}
                                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/10 rounded-lg text-cream/60 text-sm cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="text-cream/60 text-sm mb-1.5 block">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    value={user.email}
                                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/10 rounded-lg text-cream/60 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-cream/60 text-sm mb-1.5 block">Phone Number *</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+20 1XX XXX XXXX"
                                className="w-full px-4 py-3 bg-table-dark border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-table-mid border border-gold-primary/10 rounded-lg p-5">
                        <h2 className="text-cream font-display text-lg mb-4">Delivery Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-cream/60 text-sm mb-1.5 block">Street Address *</label>
                                <input
                                    type="text"
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="12 Talaat Harb St, Apt 4"
                                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-cream/60 text-sm mb-1.5 block">City *</label>
                                <input
                                    type="text"
                                    required
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Cairo"
                                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-cream/60 text-sm mb-1.5 block">Delivery Notes</label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Gate code, landmark, preferred delivery time, etc."
                                    className="w-full px-4 py-3 bg-table-dark border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createOrder.isPending}
                        className="w-full py-4 bg-gold-primary text-table-dark font-medium text-sm tracking-[0.05em] rounded-full hover:bg-cream hover:shadow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createOrder.isPending ? "Redirecting to payment..." : "Proceed to Payment"}
                    </button>
                </form>
            </div>
        </main>
    );
}