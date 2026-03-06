import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Globe, Moon, Sun } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        <h1 className="text-3xl font-bold text-foreground">{t("settingsPage")}</h1>

        {/* User Profile Section */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">{t("dashboard")}</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{t("english")}:</p>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{t("language")}</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("selectLanguage")}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setLanguage("en")}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  language === "en"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("english")}
              </button>
              <button
                onClick={() => setLanguage("ar")}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  language === "ar"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("arabic")}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === "en"
                ? "Current language: English"
                : "اللغة الحالية: العربية"}
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
            <h2 className="text-xl font-semibold">{t("theme")}</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("selectTheme")}</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (theme === "dark" && toggleTheme) toggleTheme();
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  theme === "light"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Sun className="w-4 h-4" />
                {t("lightMode")}
              </button>
              <button
                onClick={() => {
                  if (theme === "light" && toggleTheme) toggleTheme();
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Moon className="w-4 h-4" />
                {t("darkMode")}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {theme === "dark"
                ? language === "en"
                  ? "Current theme: Dark Mode"
                  : "المظهر الحالي: الوضع الداكن"
                : language === "en"
                  ? "Current theme: Light Mode"
                  : "المظهر الحالي: الوضع الفاتح"}
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm">
            {language === "en"
              ? "Your language and theme preferences are automatically saved and will be restored when you return."
              : "يتم حفظ تفضيلات اللغة والمظهر الخاصة بك تلقائياً وسيتم استعادتها عند عودتك."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
