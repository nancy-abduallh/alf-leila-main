import { useEffect, useState } from "react";
import { trpc } from "../../providers/trpc";
import { toast } from "sonner";
import { Clock, ChefHat, BellRing, Send, Utensils } from "lucide-react";

// Re-renders once a second so the countdowns actually move.
function useTick(intervalMs = 1000) {
    const [, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
}

function countdown(target: Date) {
    const ms = Math.max(0, new Date(target).getTime() - Date.now());
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

type Stage = "waiting" | "preparing" | "ready";

const stageStyles: Record<Stage, { border: string; chip: string; label: string }> = {
    waiting: {
        border: "border-yellow-500/30",
        chip: "bg-yellow-500/10 text-yellow-400",
        label: "Edit window open",
    },
    preparing: {
        border: "border-orange-500/30",
        chip: "bg-orange-500/10 text-orange-400",
        label: "Preparing",
    },
    ready: {
        border: "border-green-500/30",
        chip: "bg-green-500/10 text-green-400",
        label: "Ready for the waiter",
    },
};

export default function KitchenBoard() {
    useTick();
    const utils = trpc.useUtils();

    const { data: queue, isLoading } = trpc.order.kitchenQueue.useQuery(undefined, {
        refetchInterval: 5000,
    });

    const invalidate = () => {
        utils.order.kitchenQueue.invalidate();
        utils.order.list.invalidate();
    };

    const sendNow = trpc.order.sendBatchNow.useMutation({
        onSuccess: () => {
            invalidate();
            toast.success("Ticket sent to the kitchen");
        },
        onError: (err) => toast.error(err.message),
    });

    const setBatchStatus = trpc.order.updateBatchStatus.useMutation({
        onSuccess: () => {
            invalidate();
            toast.success("Table updated");
        },
        onError: (err) => toast.error(err.message),
    });

    if (isLoading) {
        return <div className="p-8 text-center text-cream/40">Loading the pass...</div>;
    }

    if (!queue || queue.length === 0) {
        return (
            <div className="p-12 text-center">
                <Utensils className="w-10 h-10 text-gold-primary/30 mx-auto mb-4" />
                <p className="text-cream/50">No tables on the pass right now.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {queue.map((batch) => {
                const stage: Stage =
                    batch.status === "open"
                        ? "waiting"
                        : batch.orders.every((o) => o.status === "ready" || o.status === "served")
                            ? "ready"
                            : "preparing";
                const styles = stageStyles[stage];

                return (
                    <div key={batch.id} className={`bg-table-mid border ${styles.border} rounded-lg p-5`}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-display text-cream text-2xl">
                                    Table {batch.tableNumber}
                                </h3>
                                <p className="text-cream/40 text-xs mt-1">
                                    Ticket #{batch.id} &middot; {batch.orders.length}{" "}
                                    {batch.orders.length === 1 ? "diner" : "diners"}
                                </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles.chip}`}>
                                {styles.label}
                            </span>
                        </div>

                        {stage === "waiting" && (
                            <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4">
                                <Clock className="w-4 h-4" />
                                Goes in automatically in {countdown(batch.sendAt)}
                            </div>
                        )}

                        <div className="bg-table-dark/60 rounded-md p-4 mb-4">
                            <p className="text-cream/40 text-[11px] tracking-[0.1em] uppercase mb-2">
                                Combined for the table
                            </p>
                            {batch.combinedItems.map((item) => (
                                <div
                                    key={item.dishName}
                                    className="flex justify-between text-cream text-sm py-0.5"
                                >
                                    <span>{item.dishName}</span>
                                    <span className="text-gold-primary font-medium">
                                        &times;{item.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <details className="mb-4">
                            <summary className="text-cream/50 text-xs cursor-pointer hover:text-cream/80">
                                Per-diner breakdown
                            </summary>
                            <div className="mt-3 space-y-3">
                                {batch.orders.map((order) => (
                                    <div key={order.id} className="border-l-2 border-gold-primary/20 pl-3">
                                        <p className="text-cream/60 text-xs mb-1">
                                            Order #{order.id} &middot;{" "}
                                            <span className="capitalize">{order.status.replace("_", " ")}</span>
                                        </p>
                                        {order.items.map((item) => (
                                            <p key={item.id} className="text-cream/70 text-sm">
                                                {item.quantity}&times; {item.dishName}
                                            </p>
                                        ))}
                                        {order.notes && (
                                            <p className="text-yellow-400/80 text-xs mt-1 italic">
                                                Note: {order.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </details>

                        <div className="flex flex-wrap gap-2">
                            {stage === "waiting" && (
                                <button
                                    onClick={() => sendNow.mutate({ batchId: batch.id })}
                                    disabled={sendNow.isPending}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold-primary text-table-dark text-xs font-medium rounded-full hover:bg-cream transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Send now
                                </button>
                            )}

                            {stage === "preparing" && (
                                <button
                                    onClick={() => setBatchStatus.mutate({ batchId: batch.id, status: "ready" })}
                                    disabled={setBatchStatus.isPending}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500/15 text-green-400 text-xs font-medium rounded-full hover:bg-green-500/25 transition-colors disabled:opacity-50"
                                >
                                    <BellRing className="w-3.5 h-3.5" />
                                    Mark ready
                                </button>
                            )}

                            {stage === "ready" && (
                                <button
                                    onClick={() => setBatchStatus.mutate({ batchId: batch.id, status: "served" })}
                                    disabled={setBatchStatus.isPending}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold-primary text-table-dark text-xs font-medium rounded-full hover:bg-cream transition-colors disabled:opacity-50"
                                >
                                    <Utensils className="w-3.5 h-3.5" />
                                    Waiter delivered
                                </button>
                            )}

                            {stage === "ready" && (
                                <button
                                    onClick={() => setBatchStatus.mutate({ batchId: batch.id, status: "preparing" })}
                                    disabled={setBatchStatus.isPending}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gold-primary/20 text-cream/60 text-xs rounded-full hover:bg-gold-primary/10 transition-colors disabled:opacity-50"
                                >
                                    <ChefHat className="w-3.5 h-3.5" />
                                    Back to preparing
                                </button>
                            )}

                            <button
                                onClick={() => setBatchStatus.mutate({ batchId: batch.id, status: "cancelled" })}
                                disabled={setBatchStatus.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-red-400/80 text-xs rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            >
                                Cancel table
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}