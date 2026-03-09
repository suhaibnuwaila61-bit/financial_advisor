import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Globe, Moon, Sun } from "lucide-react";

export default function Settings() {
  const { language, setLanguage, isArabic, isEnglish } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl mx-auto space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account settings</p>
        </div>

        {/* Language Settings */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Language</h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Choose your preferred language. The entire app will switch to your selected language.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => setLanguage("en")}
              variant={isEnglish ? "default" : "outline"}
              className="flex-1"
            >
              English
            </Button>
            <Button
              onClick={() => setLanguage("ar")}
              variant={isArabic ? "default" : "outline"}
              className="flex-1"
            >
              العربية
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Current language: <span className="font-semibold text-foreground">{isArabic ? "العربية (Arabic)" : "English"}</span>
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
            <h2 className="text-xl font-semibold">Theme</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Choose between light and dark mode for your preferred viewing experience.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => setTheme?.("light")}
              variant={theme === "light" ? "default" : "outline"}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Sun className="w-4 h-4" />
              Light Mode
            </Button>
            <Button
              onClick={() => setTheme?.("dark")}
              variant={theme === "dark" ? "default" : "outline"}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Moon className="w-4 h-4" />
              Dark Mode
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Current theme: <span className="font-semibold text-foreground capitalize">{theme} Mode</span>
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-semibold mb-2">Your Preferences</h3>
          <p className="text-sm">
            Your language and theme preferences are automatically saved and will be remembered the next time you visit.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
