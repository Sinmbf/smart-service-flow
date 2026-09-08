import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, QrCode, Hash, Phone, Check, AlertCircle } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { checkInToken } from "../../services/staff";

const CheckIn = () => {
  // ponytail: counter-level check-in per counter_level_checkin_no_show_queue_policy.md
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await checkInToken(identifier.trim());
      setResult(data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to check in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
          {t("staff.checkIn.title", "Staff Check-In")}
        </h1>
        <p className="mt-2 text-neutral-600">
          {t("staff.checkIn.subtitle", "Enter a token number, scan a QR, or look up by phone.")}
        </p>

        <Card className="mt-6 p-6">
          <form onSubmit={handleCheckIn} className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">
              {t("staff.checkIn.identifierLabel", "Identifier")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t("staff.checkIn.identifierPlaceholder", "Token number (e.g. D001), phone, or QR id")}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                autoFocus
              />
              <Button type="submit" disabled={isLoading || !identifier.trim()} isLoading={isLoading}>
                <Search className="h-4 w-4 mr-1" /> {t("staff.checkIn.checkIn", "Check In")}
              </Button>
            </div>
            <div className="text-xs text-neutral-500 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Token number</span>
              <span className="inline-flex items-center gap-1"><QrCode className="h-3.5 w-3.5" /> QR id</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone number</span>
            </div>
          </form>
        </Card>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2" role="alert">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <Card className="mt-4 p-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-lg">
                  {result.tokenNumber} — {result.user?.name || "Citizen"}
                </p>
                <p className="text-sm text-green-800">
                  {result.service?.nameEn} · {t("staff.checkIn.checkedIn", "Checked in")}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {t("staff.checkIn.checkedInAt", "Checked in at")} {new Date(result.checkedInAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default CheckIn;
