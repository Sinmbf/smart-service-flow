import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import { useAuth } from "../auth/AuthContext";

/**
 * Stub citizen dashboard. Step 5+ will replace this with the real
 * service list, my tokens, and history.
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
          {t("dashboard.welcome", { name: user?.name || "" })}
        </h1>
        <p className="mt-2 text-neutral-600">{t("dashboard.subtitle")}</p>

        <Card className="mt-6 p-6">
          <p className="text-sm text-neutral-500">{t("dashboard.comingSoon")}</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
