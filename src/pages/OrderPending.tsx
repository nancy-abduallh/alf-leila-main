import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTableSession } from "../providers/tableSession";
import {
    Minus,
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    Users,
    ChefHat,
    BellRing,
    Search,
    UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../providers/trpc";
import type { RouterOutputs } from "../providers/trpc";

type BatchOrder = RouterOutputs["order"]["getBatch"]["orders"][number];
type BatchOrderItem = BatchOrder["items"][number];

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

type MenuDish = RouterOutputs["dish"]["list"][number];

const MAX_PER_DISH = 50; // matches the server-side limit per line

const pickerCategories = [
    { id: "all", label: "All" },
    { id: "main", label: "Main Courses" },
    { id: "appetizer", label: "Appetizers" },
    { id: "dessert", label: "Desserts" },
    { id: "beverage", label: "Beverages" },
    { id: "breakfast", label: "Breakfast" },
] as const;

type DraftItem = {
    dishId: number;
    quantity: number;
    dishName: string;
    unitPrice: string;
};

const stageCopy: Record<string, { icon: typeof ChefHat; label: string; hint: string }> = {
    preparing: {
        icon: ChefHat,
        label: "In the kitchen",
        hint: "Your table's whole ticket went in together. We'll bring it out at the same time.",
    },
    ready: {
        icon: BellRing,
        label: "Ready — a waiter is on the way",
        hint: "Everything for your table is plated. Your waiter is bringing it over now.",
    },
    served: {
        icon: CheckCircle2,
        label: "Served",
        hint: "Enjoy your meal. Scan again any time you'd like to order more.",
    },
};

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

    // Everyone else sitting at this table who ordered inside the same window.
    const { data: batch } = trpc.order.getBatch.useQuery(
        { batchId: data?.order.batchId ?? 0 },
        { enabled: !!data?.order.batchId, refetchInterval: 5000 },
    );

    const editableUntil = data?.order.editableUntil ? new Date(data.order.editableUntil) : null;
    const msLeft = useCountdown(editableUntil);
    const isSent = !!data && data.order.status !== "pending_edit";
    const isEditable = !!data && data.order.status === "pending_edit" && msLeft > 0;

    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

    // "Add more items" picker — the menu is only fetched while the order can
    // still be edited, and only once the diner opens the picker.
    const [showPicker, setShowPicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");
    const [pickerCategory, setPickerCategory] = useState<string>("all");
    const { data: menuDishes, isLoading: menuLoading } = trpc.dish.list.useQuery(undefined, {
        enabled: isEditable && showPicker,
    });

    // Copy the saved items into the editable draft — but ONLY when the saved
    // items themselves change (first load, after Save, or edited elsewhere).
    //
    // Don't key this off the query result object: getById polls every 5s and
    // returns fresh Date objects each time, so the object identity changes on
    // every poll even when nothing did. Syncing on that used to wipe whatever
    // the diner had changed but not yet saved.
    const serverItemsKey = useMemo(
        () =>
            data
                ? JSON.stringify(
                    [...data.items]
                        .sort((a, b) => a.dishId - b.dishId)
                        .map((i) => [i.dishId, i.quantity, i.unitPrice]),
                )
                : null,
        [data],
    );
    const [syncedKey, setSyncedKey] = useState<string | null>(null);
    if (data && serverItemsKey !== syncedKey) {
        setSyncedKey(serverItemsKey);
        setDraftItems(
            data.items.map((i) => ({
                dishId: i.dishId,
                quantity: i.quantity,
                dishName: i.dishName,
                unitPrice: i.unitPrice,
            })),
        );
    }

    const updateItems = trpc.order.updateItems.useMutation({
        onSuccess: () => {
            utils.order.getById.invalidate({ id });
            utils.order.getBatch.invalidate();
            toast.success("Order updated");
        },
        onError: (err) => toast.error(err.message),
    });

    const total = useMemo(
        () => draftItems.reduce((sum, i) => sum + parseFloat(i.unitPrice) * i.quantity, 0),
        [draftItems],
    );

    // Has the diner changed anything that isn't saved yet?
    const hasChanges = useMemo(() => {
        if (!data) return false;
        const saved = new Map(data.items.map((i) => [i.dishId, i.quantity]));
        if (saved.size !== draftItems.length) return true;
        return draftItems.some((i) => saved.get(i.dishId) !== i.quantity);
    }, [data, draftItems]);

    const draftQty = useMemo(
        () => new Map(draftItems.map((i) => [i.dishId, i.quantity])),
        [draftItems],
    );

    const pickerDishes = useMemo(() => {
        const term = pickerSearch.trim().toLowerCase();
        return (menuDishes ?? []).filter((d) => {
            if (pickerCategory !== "all" && d.category !== pickerCategory) return false;
            if (!term) return true;
            return (
                d.name.toLowerCase().includes(term) ||
                (d.nameAr ? d.nameAr.toLowerCase().includes(term) : false)
            );
        });
    }, [menuDishes, pickerSearch, pickerCategory]);

    const tableMates = useMemo(
        () => (batch?.orders ?? []).filter((o) => o.id !== id),
        [batch, id],
    );

    const changeQty = (dishId: number, quantity: number) => {
        setDraftItems((prev) =>
            quantity <= 0
                ? prev.filter((i) => i.dishId !== dishId)
                : prev.map((i) => (i.dishId === dishId ? { ...i, quantity } : i)),
        );
    };

    // Add one of a dish: bump the quantity if it's already in the order,
    // otherwise append it as a new line.
    const addDish = (dish: MenuDish) => {
        setDraftItems((prev) => {
            const existing = prev.find((i) => i.dishId === dish.id);
            if (existing) {
                return prev.map((i) =>
                    i.dishId === dish.id
                        ? { ...i, quantity: Math.min(MAX_PER_DISH, i.quantity + 1) }
                        : i,
                );
            }
            return [
                ...prev,
                { dishId: dish.id, quantity: 1, dishName: dish.name, unitPrice: dish.price },
            ];
        });
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
    const stage = stageCopy[data.order.status] ?? stageCopy.preparing;
    const StageIcon = stage.icon;

    return (
        <main className="bg-table-dark min-h-screen pt-[72px]">
            <div className="max-w-[700px] mx-auto px-6 py-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-gold-primary/20 text-gold-primary text-xs tracking-[0.1em] uppercase">
                    Table {data.order.tableNumber}
                </div>

                {isSent ? (
                    <div className="text-center py-6">
                        <StageIcon className="w-14 h-14 text-gold-primary mx-auto mb-4" />
                        <h1 className="font-display text-cream text-2xl mb-2">{stage.label}</h1>
                        <p className="text-cream/50 text-sm max-w-sm mx-auto">{stage.hint}</p>

                        <div className="mt-10 text-left space-y-2 bg-table-mid border border-gold-primary/10 rounded-lg p-5">
                            {data.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-cream/70">
                                        {item.quantity}&times; {item.dishName}
                                    </span>
                                    <span className="text-cream/40">
                                        {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)} EGP
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between border-t border-gold-primary/10 pt-3 mt-3">
                                <span className="text-cream/70 text-sm">Your total</span>
                                <span className="text-gold-primary font-display">
                                    {data.order.totalAmount} EGP
                                </span>
                            </div>
                        </div>

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
                            You can still change this order. When the timer runs out it goes to the kitchen
                            automatically, together with every other order placed at Table{" "}
                            {data.order.tableNumber} in the same window — so your table is served all at once.
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
                                            disabled={!isEditable}
                                            className="p-1.5 rounded border border-gold-primary/20 hover:bg-gold-primary/10 text-cream/70 disabled:opacity-40"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-cream text-sm w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => changeQty(item.dishId, item.quantity + 1)}
                                            disabled={!isEditable}
                                            className="p-1.5 rounded border border-gold-primary/20 hover:bg-gold-primary/10 text-cream/70 disabled:opacity-40"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => changeQty(item.dishId, 0)}
                                            disabled={!isEditable}
                                            className="ml-2 p-1.5 text-red-400 hover:bg-red-500/10 rounded disabled:opacity-40"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isEditable && (
                            <div className="mb-8">
                                <button
                                    type="button"
                                    onClick={() => setShowPicker((v) => !v)}
                                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gold-primary/40 text-gold-primary text-sm rounded-lg hover:bg-gold-primary/10 transition-colors"
                                >
                                    {showPicker ? (
                                        <Minus className="w-4 h-4" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    {showPicker ? "Hide menu" : "Add more items"}
                                </button>

                                {showPicker && (
                                    <div className="mt-4 bg-table-mid/60 border border-gold-primary/15 rounded-lg p-4">
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
                                            <input
                                                type="text"
                                                value={pickerSearch}
                                                onChange={(e) => setPickerSearch(e.target.value)}
                                                placeholder="Search dishes..."
                                                className="w-full pl-10 pr-4 py-2.5 bg-table-dark border border-gold-primary/20 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-primary transition-colors"
                                            />
                                        </div>

                                        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                                            {pickerCategories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setPickerCategory(cat.id)}
                                                    className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${pickerCategory === cat.id
                                                        ? "bg-gold-primary text-table-dark"
                                                        : "border border-gold-primary/30 text-cream/70 hover:border-gold-primary hover:text-gold-primary"
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                                            {menuLoading ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="w-6 h-6 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            ) : pickerDishes.length === 0 ? (
                                                <div className="text-center py-8 text-cream/40 text-sm">
                                                    <UtensilsCrossed className="w-6 h-6 mx-auto mb-2 text-gold-primary/30" />
                                                    No dishes match.
                                                </div>
                                            ) : (
                                                pickerDishes.map((dish) => {
                                                    const inOrder = draftQty.get(dish.id) ?? 0;
                                                    const outOfStock = dish.stock !== null && dish.stock <= 0;
                                                    return (
                                                        <div
                                                            key={dish.id}
                                                            className="flex items-center justify-between gap-3 bg-table-dark border border-gold-primary/10 rounded-lg p-3"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="text-cream text-sm font-medium truncate">
                                                                    {dish.name}
                                                                </p>
                                                                <p className="text-cream/40 text-xs">
                                                                    {dish.price} EGP
                                                                    {inOrder > 0 && (
                                                                        <span className="ml-2 text-gold-primary">
                                                                            &times;{inOrder} in your order
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => addDish(dish)}
                                                                disabled={outOfStock || inOrder >= MAX_PER_DISH}
                                                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${outOfStock
                                                                    ? "bg-cream/10 text-cream/30 cursor-not-allowed"
                                                                    : "bg-gold-primary text-table-dark hover:bg-cream disabled:opacity-40"
                                                                    }`}
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                                {outOfStock ? "Out of stock" : "Add"}
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-gold-primary/10 pt-4 mb-8">
                            <span className="text-cream/70">Total</span>
                            <span className="text-gold-primary text-xl font-display">{total.toFixed(2)} EGP</span>
                        </div>

                        {isEditable && hasChanges && (
                            <p className="text-gold-primary/80 text-xs text-center mb-3">
                                You have unsaved changes — press Save Changes before the timer runs out.
                            </p>
                        )}

                        <button
                            onClick={saveChanges}
                            disabled={!isEditable || updateItems.isPending || !hasChanges}
                            className="w-full py-4 bg-gold-primary text-table-dark font-medium text-sm tracking-[0.05em] rounded-full hover:bg-cream hover:shadow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateItems.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                )}

                {tableMates.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center gap-2 text-cream/40 text-xs tracking-[0.1em] uppercase mb-4">
                            <Users className="w-4 h-4" />
                            Also on this table&apos;s ticket
                        </div>
                        <div className="space-y-3">
                            {tableMates.map((mate) => (
                                <div
                                    key={mate.id}
                                    className="bg-table-mid/50 border border-gold-primary/10 rounded-lg p-4"
                                >
                                    <p className="text-cream/50 text-xs mb-2">Order #{mate.id}</p>
                                    {mate.items.map((item: BatchOrderItem) => (
                                        <p key={item.id} className="text-cream/70 text-sm">
                                            {item.quantity}&times; {item.dishName}
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main >
    );
}