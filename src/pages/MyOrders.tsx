import { trpc } from "@/providers/trpc";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    paid: "bg-blue-500/10 text-blue-400",
    preparing: "bg-orange-500/10 text-orange-400",
    delivered: "bg-green-500/10 text-green-400",
    failed: "bg-red-500/10 text-red-400",
    cancelled: "bg-red-500/10 text-red-400",
};

export default function MyOrders() {
    const { data: orders, isLoading } = trpc.order.myOrders.useQuery();

    return (
        <main className="bg-table-dark min-h-screen pt-[72px]">
            <div className="max-w-[900px] mx-auto px-6 py-16">
                <h1 className="font-display text-cream text-2xl mb-8">My Orders</h1>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-table-mid rounded-lg h-32" />
                        ))}
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-table-mid border border-gold-primary/10 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-cream font-medium">Order #{order.id}</p>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="space-y-1 mb-3">
                                    {order.items.map((item) => (
                                        <p key={item.id} className="text-cream/60 text-sm">
                                            {item.quantity}x {item.dishName}
                                        </p>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-sm border-t border-gold-primary/10 pt-3">
                                    <span className="text-cream/40">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-gold-primary font-medium">{order.totalAmount} EGP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Package className="w-10 h-10 text-gold-primary/30 mx-auto mb-4" />
                        <p className="text-cream/50">No orders yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}