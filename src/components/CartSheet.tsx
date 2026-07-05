import { Link } from "react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart";

type CartSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
    const { items, updateQuantity, removeItem, totalPrice } = useCart();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Your Order</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground text-sm">Your cart is empty</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.dishId} className="flex gap-3 border-b pb-4">
                                <img
                                    src={item.imageUrl || "/hero-food-molokhia.jpg"}
                                    alt={item.name}
                                    className="w-16 h-16 rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.price} EGP</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                                            className="p-1 rounded border hover:bg-accent"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                                            className="p-1 rounded border hover:bg-accent"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.dishId)}
                                            className="ml-auto p-1 text-destructive hover:bg-destructive/10 rounded"
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="flex-col gap-3">
                        <div className="flex items-center justify-between w-full text-sm font-medium">
                            <span>Total</span>
                            <span>{totalPrice.toFixed(2)} EGP</span>
                        </div>
                        <Button asChild className="w-full" size="lg" onClick={() => onOpenChange(false)}>
                            <Link to="/checkout">Proceed to Checkout</Link>
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}