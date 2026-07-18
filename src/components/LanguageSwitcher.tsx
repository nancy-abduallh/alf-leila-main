import { Globe } from "lucide-react";
import { useLanguage } from "../providers/language";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const options = [
    { code: "en" as const, label: "English" },
    { code: "ar" as const, label: "العربية" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
    const { language, setLanguage } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={`flex items-center gap-1.5 text-cream/80 text-[13px] font-medium hover:text-gold-primary transition-colors outline-none ${className ?? ""}`}
                aria-label="Change language"
            >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "EN" : "AR"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                {options.map((opt) => (
                    <DropdownMenuItem
                        key={opt.code}
                        onClick={() => setLanguage(opt.code)}
                        className={language === opt.code ? "font-semibold text-gold-primary" : ""}
                    >
                        {opt.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}