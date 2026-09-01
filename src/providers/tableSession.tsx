import {
    createContext,
    useContext,
    useEffect,
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

    const setSession = (next: TableSessionValue) => setSessionState(next);
    const clearSession = () => setSessionState(null);

    return (
        <TableSessionContext.Provider value={{ session, setSession, clearSession }}>
            {children}
        </TableSessionContext.Provider>
    );
}

export function useTableSession() {
    const ctx = useContext(TableSessionContext);
    if (!ctx) throw new Error("useTableSession must be used within a TableSessionProvider");
    return ctx;
}