import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { translations, type Language } from "../i18n/translations";

type LanguageContextValue = {
    language: Language;
    setLanguage: (lang: Language) => void;
    dir: "ltr" | "rtl";
    /** Dot-path lookup, e.g. t("menu.categories.beverage") */
    t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "alf-leila-language";

function getNested(obj: unknown, path: string): string {
    const value = path
        .split(".")
        .reduce<unknown>((acc, key) => {
            if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
                return (acc as Record<string, unknown>)[key];
            }
            return undefined;
        }, obj);
    return typeof value === "string" ? value : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window === "undefined") return "en";
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved === "ar" || saved === "en" ? saved : "en";
    });

    const dir: "ltr" | "rtl" = language === "ar" ? "rtl" : "ltr";

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
    }, [language, dir]);

    const setLanguage = (lang: Language) => setLanguageState(lang);
    const t = (path: string) => getNested(translations[language], path);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
    return ctx;
}