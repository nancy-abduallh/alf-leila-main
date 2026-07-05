import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type CartItem = {
    dishId: number;
    name: string;
    price: string;
    imageUrl: string | null;
    quantity: number;
};

type CartContextValue = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (dishId: number) => void;
    updateQuantity: (dishId: number, quantity: number) => void;
    clear: () => void;
    totalItems: number;
    totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "alf-leila-cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as CartItem[]) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.dishId === item.dishId);
            if (existing) {
                return prev.map((i) =>
                    i.dishId === item.dishId ? { ...i, quantity: i.quantity + quantity } : i,
                );
            }
            return [...prev, { ...item, quantity }];
        });
    };

    const removeItem = (dishId: number) => {
        setItems((prev) => prev.filter((i) => i.dishId !== dishId));
    };

    const updateQuantity = (dishId: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(dishId);
            return;
        }
        setItems((prev) => prev.map((i) => (i.dishId === dishId ? { ...i, quantity } : i)));
    };

    const clear = () => setItems([]);

    const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
    const totalPrice = useMemo(
        () => items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0),
        [items],
    );

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clear, totalItems, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within a CartProvider");
    return ctx;
}