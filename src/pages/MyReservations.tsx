import { trpc } from "../providers/trpc";
import { useLanguage } from "../providers/language";
import { areaLabel } from "../../contracts/constants";
import { CalendarX } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    confirmed: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
};

export default function MyReservations() {
    const { t, language } = useLanguage();
    const utils = trpc.useUtils();
    const { data: reservations, isLoading } = trpc.reservation.myReservations.useQuery();

    const cancelReservation = trpc.reservation.cancel.useMutation({
        onSuccess: () => {
            utils.reservation.myReservations.invalidate();
            toast.success(t("myReservations.cancelled"));
        },
        onError: (err) => toast.error(err.message),
    });

    return (
        <main className="bg-table-dark min-h-screen pt-[72px]">
            <div className="max-w-[700px] mx-auto px-6 py-16">
                <h1 className="font-display text-cream text-2xl mb-8">
                    {t("myReservations.title")}
                </h1>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-table-mid rounded-lg h-24" />
                        ))}
                    </div>
                ) : reservations && reservations.length > 0 ? (
                    <div className="space-y-4">
                        {reservations.map((res) => (
                            <div
                                key={res.id}
                                className="bg-table-mid border border-gold-primary/10 rounded-lg p-5 flex items-start justify-between gap-4"
                            >
                                <div className="min-w-0">
                                    <p className="text-cream font-medium">
                                        {new Date(res.date).toLocaleDateString()} · {res.time.slice(0, 5)}
                                    </p>
                                    <p className="text-cream/50 text-sm">
                                        {res.guests} {t("reservePage.guests")}
                                    </p>

                                    {res.tableNumber ? (
                                        <p className="text-gold-primary text-sm mt-2">
                                            {t("myReservations.table")} {res.tableNumber}
                                            {res.preferredArea && (
                                                <span className="text-cream/40">
                                                    {" "}· {areaLabel(res.preferredArea, language)}
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-cream/40 text-xs mt-2">
                                            {t("myReservations.noTable")}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[res.status]}`}
                                    >
                                        {t(`myReservations.status.${res.status}`)}
                                    </span>

                                    {res.status !== "cancelled" && (
                                        <button
                                            onClick={() => cancelReservation.mutate({ id: res.id })}
                                            disabled={cancelReservation.isPending}
                                            className="text-xs text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-50"
                                        >
                                            {t("myReservations.cancel")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <CalendarX className="w-10 h-10 text-gold-primary/30 mx-auto mb-4" />
                        <p className="text-cream/50">{t("myReservations.empty")}</p>
                    </div>
                )}
            </div>
        </main>
    );
}