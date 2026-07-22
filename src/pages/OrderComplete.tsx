import { useSearchParams, Link } from "react-router";
import { CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "../providers/language";

export default function OrderComplete() {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success") === "true";
    const merchantOrderId = searchParams.get("merchant_order_id");
    const { t } = useLanguage();

    return (
        <main className="bg-table-dark min-h-screen pt-[72px] flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                {success ? (
                    <>
                        <CheckCircle className="w-16 h-16 text-gold-primary mx-auto mb-6" />
                        <h1 className="font-display text-cream text-2xl mb-3">{t("orderComplete.successTitle")}</h1>
                        <p className="text-cream/60 text-sm mb-2">
                            {t("orderComplete.thankYou")}{merchantOrderId ? ` #${merchantOrderId}` : ""} {t("orderComplete.hasBeenPlaced")}
                        </p>
                        <p className="text-cream/40 text-sm mb-8">
                            {t("orderComplete.beginPreparing")}
                        </p>
                    </>
                ) : (
                    <>
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                        <h1 className="font-display text-cream text-2xl mb-3">{t("orderComplete.failedTitle")}</h1>
                        <p className="text-cream/60 text-sm mb-8">
                            {t("orderComplete.failedMessage")}
                        </p>
                    </>
                )}
                <Link
                    to="/menu"
                    className="inline-block px-8 py-3 bg-gold-primary text-table-dark font-medium text-sm rounded-full hover:bg-cream transition-colors"
                >
                    {t("orderComplete.backToMenu")}
                </Link>
            </div>
        </main>
    );
}