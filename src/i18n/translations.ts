export type Language = "en" | "ar";

export const translations = {
    en: {
        nav: {
            home: "HOME",
            menu: "MENU",
            reserve: "RESERVE TABLE",
            story: "STORY",
            contact: "CONTACT",
            signIn: "Sign In",
            profile: "Profile",
            myOrders: "My Orders",
            myReservations: "My Reservations",
            logout: "Logout",
        },
        menu: {
            eyebrow: "DISCOVER",
            title: "Our Menu",
            searchPlaceholder: "Search dishes...",
            categories: {
                all: "All",
                main: "Main Courses",
                appetizer: "Appetizers",
                dessert: "Desserts",
                beverage: "Beverages",
                breakfast: "Breakfast",
            },
            subcategories: {
                all: "All",
                coffee: "Coffee",
                tea: "Tea",
                others: "Others",
            },
            add: "Add",
            outOfStock: "Out of stock",
            addedToCart: "added to cart",
            noResults: "No dishes found.",
            adjustFilters: "Try adjusting your filters.",
            couldNotLoad: "Couldn't load the menu.",
            healthCheckHint:
                "If this mentions a database issue, check the DATABASE_URL environment variable and visit /api/health for details.",
        },
        footer: {
            quickLinks: "Quick Links",
            hours: "Hours",
            contact: "Contact",
            tagline:
                "A thousand and one nights of flavor. Experience the magic of authentic Egyptian cuisine in the heart of Cairo.",
        },
        common: {
            loading: "Loading...",
        },
    },
    ar: {
        nav: {
            home: "الرئيسية",
            menu: "القائمة",
            reserve: "احجز طاولة",
            story: "قصتنا",
            contact: "تواصل معنا",
            signIn: "تسجيل الدخول",
            profile: "الملف الشخصي",
            myOrders: "طلباتي",
            myReservations: "حجوزاتي",
            logout: "تسجيل الخروج",
        },
        menu: {
            eyebrow: "اكتشف",
            title: "قائمتنا",
            searchPlaceholder: "ابحث عن طبق...",
            categories: {
                all: "الكل",
                main: "الأطباق الرئيسية",
                appetizer: "المقبلات",
                dessert: "الحلويات",
                beverage: "المشروبات",
                breakfast: "الإفطار",
            },
            subcategories: {
                all: "الكل",
                coffee: "قهوة",
                tea: "شاي",
                others: "أخرى",
            },
            add: "أضف",
            outOfStock: "غير متوفر",
            addedToCart: "أُضيف إلى السلة",
            noResults: "لم يتم العثور على أطباق.",
            adjustFilters: "حاول تعديل الفلاتر.",
            couldNotLoad: "تعذر تحميل القائمة.",
            healthCheckHint:
                "إذا كانت هذه مشكلة قاعدة بيانات، تحقق من متغير DATABASE_URL وزر /api/health لمزيد من التفاصيل.",
        },
        footer: {
            quickLinks: "روابط سريعة",
            hours: "ساعات العمل",
            contact: "تواصل معنا",
            tagline: "ألف ليلة وليلة من النكهات. عِش سحر المطبخ المصري الأصيل في قلب القاهرة.",
        },
        common: {
            loading: "جارٍ التحميل...",
        },
    },
} as const;

export type TranslationDict = typeof translations.en;