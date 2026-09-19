import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type TableSessionValue = {
    tableId: number;
    tableNumber: string;
} | null;

type TableSessionContextValue = {
    session: TableSessionValue;
    setSession: (session: TableSessionValue) => void;
    clearSession: () => void;
};

const TableSessionContext = createContext<TableSessionContextValue | null>(null);
const STORAGE_KEY = "alf-leila-table-session";

// Per-tab flag: "this tab arrived through a table QR code". Lets a signed-in
// admin test the customer QR flow without App.tsx bouncing them back to
// /admin. sessionStorage (not localStorage) so it never outlives the tab.
const QR_PREVIEW_KEY = "alf-leila-qr-preview";

export function markQrPreview() {
    try {
        window.sessionStorage.setItem(QR_PREVIEW_KEY, "1");
    } catch {
        /* storage unavailable — the preview exemption just won't apply */
    }
}

export function isQrPreview(): boolean {
    try {
        return window.sessionStorage.getItem(QR_PREVIEW_KEY) === "1";
    } catch {
        return false;
    }
}

export function clearQrPreview() {
    try {
        window.sessionStorage.removeItem(QR_PREVIEW_KEY);
    } catch {
        /* ignore */
    }
}

export function TableSessionProvider({ children }: { children: ReactNode }) {
    const [session, setSessionState] = useState<TableSessionValue>(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as TableSessionValue) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (session) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, [session]);

    // These MUST be referentially stable. Consumers (TableScan) list them in
    // useEffect dependency arrays; when they were re-created on every render,
    // the effect re-ran after every state change, set state again, and looped
    // forever ("Maximum update depth exceeded") — leaving a blank page after
    // scanning a QR code.
    const setSession = useCallback((next: TableSessionValue) => {
        setSessionState((prev) =>
            // Same table again → keep the old object so nothing re-renders.
            prev && next && prev.tableId === next.tableId && prev.tableNumber === next.tableNumber
                ? prev
                : next,
        );
    }, []);
    const clearSession = useCallback(() => setSessionState(null), []);

    const value = useMemo(
        () => ({ session, setSession, clearSession }),
        [session, setSession, clearSession],
    );

    return (
        <TableSessionContext.Provider value={value}>
            {children}
        </TableSessionContext.Provider>
    );
}

export function useTableSession() {
    const ctx = useContext(TableSessionContext);
    if (!ctx) throw new Error("useTableSession must be used within a TableSessionProvider");
    return ctx;
}