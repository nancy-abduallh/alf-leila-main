import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { trpc } from "../providers/trpc";
import { useTableSession } from "../providers/tableSession";
import { Loader2, AlertTriangle } from "lucide-react";

export default function TableScan() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { setSession } = useTableSession();

    const { data, isLoading, isError, error } = trpc.table.resolveQr.useQuery(
        { code: code ?? "" },
        { enabled: !!code, retry: false },
    );

    useEffect(() => {
        if (data) {
            setSession({ tableId: data.tableId, tableNumber: data.tableNumber });
            navigate("/menu", { replace: true });
        }
    }, [data, setSession, navigate]);

    return (
        <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center px-6">
            <div className="text-center max-w-sm">
                {isLoading ? (
                    <>
                        <Loader2 className="w-10 h-10 text-gold-primary mx-auto mb-4 animate-spin" />
                        <p className="text-cream/60 text-sm">Setting up your table...</p>
                    </>
                ) : isError ? (
                    <>
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                        <h1 className="font-display text-cream text-xl mb-2">Couldn&apos;t recognize this table</h1>
                        <p className="text-cream/50 text-sm">{error?.message}</p>
                    </>
                ) : null}
            </div>
        </main>
    );
}