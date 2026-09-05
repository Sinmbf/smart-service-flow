import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import { useAuth } from "../auth/AuthContext";

/**
 * Stub staff dashboard. Step 4+ (Increment 10 — staff/admin) will expand.
 */
const StaffDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
          {t("staff.dashboard.welcome", { name: user?.name || "" })}
        </h1>
        <p className="mt-2 text-neutral-600">{t("staff.dashboard.subtitle")}</p>

        <Card className="mt-6 p-6">
          <div className="space-y-3">
            <a href="/staff/check-in" className="block p-3 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition">
              <h3 className="font-heading font-semibold text-neutral-900">Check-In</h3>
              <p className="text-xs text-neutral-500">Look up a token by number, QR, or phone</p>
            </a>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StaffDashboard;
