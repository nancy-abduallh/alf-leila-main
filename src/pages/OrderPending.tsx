import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { trpc } from "../providers/trpc";
import { useTableSession } from "../providers/tableSession";
import { Minus, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

function useCountdown(target: Date | null) {
    const [msLeft, setMsLeft] = useState(() => (target ? target.getTime() - Date.now() : 0));

    useEffect(() => {
        if (!target) return;
        const tick = () => setMsLeft(target.getTime() - Date.now());
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [target]);

    return Math.max(0, msLeft);
}

export default function OrderPending() {
    const { orderId } = useParams<{ orderId: string }>();
    const id = Number(orderId);
    const navigate = useNavigate();
    const { clearSession } = useTableSession();
    const utils = trpc.useUtils();

    const { data, isLoading } = trpc.order.getById.useQuery(
        { id },
        { enabled: !Number.isNaN(id), refetchInterval: 5000 },
    );

    const editableUntil = data?.order.editableUntil ? new Date(data.order.editableUntil) : null;
    const msLeft = useCountdown(editableUntil);
    const isSent = !!data && data.order.status !== "pending_edit";
    const isEditable = !!data && data.order.status === "pending_edit" && msLeft > 0;

    const [draftItems, setDraftItems] = useState
    { dishId: number; quantity: number; dishName: string; unitPrice: string } []
        > ([]);

    useEffect(() => {
        if (data) {
            setDraftItems(
                data.items.map((i) => ({
                    dishId: i.dishId,
                    quantity: i.quantity,
                    dishName: i.dishName,
                    unitPrice: i.unitPrice,
                })),
            );
        }
    }, [data]);

    const updateItems = trpc.order.updateItems.useMutation({
        onSuccess: () => {
            utils.order.getById.invalidate({ id });
            toast.success("Order updated");
        },
        onError: (err) => toast.error(err.message),
    });

    const total = useMemo(
        () => draftItems.reduce((sum, i) => sum + parseFloat(i.unitPrice) * i.quantity, 0),
        [draftItems],
    );

    const changeQty = (dishId: number, quantity: number) => {
        setDraftItems((prev) =>
            quantity <= 0
                ? prev.filter((i) => i.dishId !== dishId)
                : prev.map((i) => (i.dishId === dishId ? { ...i, quantity } : i)),
        );
    };

    const saveChanges = () => {
        if (draftItems.length === 0) {
            toast.error("Your order needs at least one item");
            return;
        }
        updateItems.mutate({
            orderId: id,
            items: draftItems.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
        });
    };

    if (isLoading || !data) {
        return (
            <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    const minutes = Math.floor(msLeft / 60000);
    const seconds = Math.floor((msLeft % 60000) / 1000);

    return (
        <main className="bg-table-dark min-h-screen pt-[72px]">
            <div className="max-w-[700px] mx-auto px-6 py-16">
                {isSent ? (
                    <div className="text-center py-10">
                        <CheckCircle2 className="w-14 h-14 text-gold-primary mx-auto mb-4" />
                        <h1 className="font-display text-cream text-2xl mb-2">Sent to the kitchen!</h1>
                        <p className="text-cream/50 text-sm">
                            Your order for Table {data.order.tableNumber} is being prepared, along with everyone
                            else&apos;s order from your table placed in the same window.
                        </p>
                        <button
                            onClick={() => {
                                clearSession();
                                navigate("/menu");
                            }}
                            className="mt-8 px-6 py-2.5 bg-gold-primary text-table-dark text-sm font-medium rounded-full hover:bg-cream transition-colors"
                        >
                            Order Something Else
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 text-gold-primary mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm tracking-[0.1em] uppercase">Editable for</span>
                        </div>
                        <h1 className="font-display text-cream text-3xl mb-6">
                            {minutes}:{seconds.toString().padStart(2, "0")}
                        </h1>
                        <p className="text-cream/50 text-sm mb-8">
                            You can still change this order for Table {data.order.tableNumber}. Once the timer runs
                            out it will be sent to the kitchen automatically, together with any other orders from
                            your table.
                        </p>

                        <div className="space-y-4 mb-8">
                            {draftItems.map((item) => (
                                <div
                                    key={item.dishId}
                                    className="flex items-center justify-between gap-4 bg-table-mid border border-gold-primary/10 rounded-lg p-4"
                                >
                                    <div>
                                        <p className="text-cream font-medium">{item.dishName}</p>
                                        <p className="text-cream/40 text-xs">{item.unitPrice} EGP each</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => changeQty(item.dishId, item.quantity - 1)}
                                            className="p-1.5 rounded border border-gold-primary/20 hover:bg-gold-primary/10 text-cream/70"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-cream text-sm w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => changeQty(item.dishId, item.quantity + 1)}
                                            className="p-1.5 rounded border border-gold-primary/20 hover:bg-gold-primary/10 text-cream/70"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => changeQty(item.dishId, 0)}
                                            className="ml-2 p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-gold-primary/10 pt-4 mb-8">
                            <span className="text-cream/70">Total</span>
                            <span className="text-gold-primary text-xl font-display">{total.toFixed(2)} EGP</span>
                        </div>

                        <button
                            onClick={saveChanges}
                            disabled={!isEditable || updateItems.isPending}
                            className="w-full py-4 bg-gold-primary text-table-dark font-medium text-sm tracking-[0.05em] rounded-full hover:bg-cream hover:shadow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateItems.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}