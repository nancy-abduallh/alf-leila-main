import { useSearchParams, Link } from "react-router";
import { CheckCircle, XCircle } from "lucide-react";

export default function OrderComplete() {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success") === "true";
    const merchantOrderId = searchParams.get("merchant_order_id");

    return (
        <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                {success ? (
                    <>
                        <CheckCircle className="w-16 h-16 text-gold-primary mx-auto mb-6" />
                        <h1 className="font-display text-cream text-2xl mb-3">Payment Successful</h1>
                        <p className="text-cream/60 text-sm mb-2">
                            Thank you! Your order{merchantOrderId ? ` #${merchantOrderId}` : ""} has been
                            placed.
                        </p>
                        <p className="text-cream/40 text-sm mb-8">
                            We'll begin preparing it right away.
                        </p>
                    </>
                ) : (
                    <>
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                        <h1 className="font-display text-cream text-2xl mb-3">Payment Failed</h1>
                        <p className="text-cream/60 text-sm mb-8">
                            Something went wrong processing your payment. Please try again.
                        </p>
                    </>
                )}
                <Link
                    to="/menu"
                    className="inline-block px-8 py-3 bg-gold-primary text-table-dark font-medium text-sm rounded-full hover:bg-cream transition-colors"
                >
                    Back to Menu
                </Link>
            </div>
        </main>
    );
}