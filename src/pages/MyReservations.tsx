import { trpc } from "@/providers/trpc";
import { CalendarX } from "lucide-react";

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    confirmed: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
};

export default function MyReservations() {
    const { data: reservations, isLoading } = trpc.reservation.myReservations.useQuery();

    return (
        <main className="bg-table-dark min-h-screen pt-[72px]">
            <div className="max-w-[700px] mx-auto px-6 py-16">
                <h1 className="font-display text-cream text-2xl mb-8">My Reservations</h1>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-table-mid rounded-lg h-24" />
                        ))}
                    </div>
                ) : reservations && reservations.length > 0 ? (
                    <div className="space-y-4">
                        {reservations.map((res) => (
                            <div key={res.id} className="bg-table-mid border border-gold-primary/10 rounded-lg p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-cream font-medium">
                                        {new Date(res.date).toLocaleDateString()} at {res.time}
                                    </p>
                                    <p className="text-cream/50 text-sm">{res.guests} guests</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[res.status]}`}>
                                    {res.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <CalendarX className="w-10 h-10 text-gold-primary/30 mx-auto mb-4" />
                        <p className="text-cream/50">No reservations yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}