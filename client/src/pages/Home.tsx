import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Gauge,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Mail,
  Check,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const Home = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.location.href = "/token/services";
    }
  };

  return (
    <MainLayout>
      {/* ============================================
          HERO — Finpay split layout with mint gradient
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Mint gradient bleed on the right */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block"
          style={{
            background:
              "linear-gradient(135deg, #EAF4F5 0%, #CFE3E6 60%, #A4CDD2 100%)",
            clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
          }}
          aria-hidden="true"
        />
        {/* Soft mint tint for mobile */}
        <div
          className="pointer-events-none absolute inset-0 lg:hidden opacity-30"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, #EAF4F5 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center px-4 sm:px-6 md:px-8 pt-10 pb-12 lg:py-20">
          {/* LEFT — Headline + email capture */}
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-neutral-900 tracking-tight leading-[1.05]">
              {t("home.hero.headline1")}
              <br />
              <span className="text-primary-700">
                {t("home.hero.headline2")}
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-md">
              {t("home.hero.subheadline")}
            </p>

            {/* Email-capture row */}
            <form
              onSubmit={handleGetStarted}
              className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 max-w-md"
            >
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("home.hero.emailPlaceholder")}
                  className="w-full min-h-[48px] pl-12 pr-4 py-3 text-base text-neutral-900 bg-white border-2 border-neutral-200 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 placeholder:text-neutral-400 shadow-sm"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-full px-7 shadow-lg"
                icon={<ArrowRight className="h-5 w-5" />}
              >
                {t("home.hero.getStarted")}
              </Button>
            </form>
          </div>

          {/* RIGHT — Decorative service card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Floating back-card */}
              <div
                className="absolute -top-4 -left-4 w-44 h-56 rounded-2xl shadow-lg hidden sm:block"
                style={{
                  background:
                    "linear-gradient(160deg, #0F4C5C 0%, #1F6F7A 100%)",
                }}
                aria-hidden="true"
              >
                <div className="p-5 text-white">
                  <p className="text-xs font-heading font-medium text-primary-100 uppercase tracking-wider">
                    Service
                  </p>
                  <p className="text-lg font-heading font-bold mt-2">
                    Citizenship
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-primary-100 uppercase">Token</p>
                      <p className="text-2xl font-heading font-bold tracking-wider">
                        A024
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-primary-200" />
                  </div>
                </div>
              </div>

              {/* Main card */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 sm:p-7">
                {/* Org / Issuer row */}
                <div className="flex items-center gap-3">
                  <div className="bg-primary-700 p-2.5 rounded-xl shadow-md">
                    <svg
                      className="h-7 w-7 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3L2 8V10H22V8L12 3Z"
                        fill="currentColor"
                      />
                      <rect x="4" y="10" width="3" height="8" fill="currentColor" />
                      <rect x="10" y="10" width="4" height="8" fill="currentColor" />
                      <rect x="17" y="10" width="3" height="8" fill="currentColor" />
                      <rect x="2" y="18" width="20" height="2" fill="currentColor" />
                      <circle cx="12" cy="6" r="1" fill="#DC2626" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-semibold text-neutral-900">
                      {t("home.hero.cardIssuer")}
                    </p>
                    <p className="text-xs text-neutral-500">
                      citizen@gov.example
                    </p>
                  </div>
                </div>

                {/* Token number */}
                <div className="mt-5">
                  <p className="text-xs font-heading font-medium text-neutral-500 uppercase tracking-wider">
                    {t("home.hero.cardLabel")}
                  </p>
                  <p className="mt-1 text-4xl sm:text-5xl font-heading font-bold text-neutral-900">
                    $1,876,580
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    April 21, 2026
                  </p>
                </div>

                {/* Service rows */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-primary-500 bg-primary-50">
                    <div className="flex items-center gap-2 text-primary-800">
                      <span className="text-sm font-heading font-semibold">
                        {t("home.hero.cardService1")}
                      </span>
                    </div>
                    <Check className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <span className="text-sm font-heading font-semibold">
                        {t("home.hero.cardService2")}
                      </span>
                    </div>
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-300" />
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => (window.location.href = "/token/services")}
                  className="mt-5 w-full min-h-[48px] bg-gradient-to-r from-primary-700 to-primary-500 text-white font-heading font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-primary-800 hover:to-primary-600 transition-all flex items-center justify-center gap-2"
                >
                  {t("home.hero.cardCta")}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip — partner-equivalent text labels */}
        <div className="relative border-t border-neutral-200/70 bg-white/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-10 gap-y-4">
              <span className="text-lg sm:text-xl font-heading font-bold text-neutral-400 tracking-tight">
                {t("home.trust.gov")}
              </span>
              <span className="text-lg sm:text-xl font-heading font-bold text-neutral-400 tracking-tight">
                {t("home.trust.public")}
              </span>
              <span className="text-lg sm:text-xl font-heading font-bold text-neutral-400 tracking-tight">
                {t("home.trust.digital")}
              </span>
              <span className="text-lg sm:text-xl font-heading font-bold text-neutral-400 tracking-tight">
                {t("home.trust.national")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES — "Experience that grows with your scale"
          ============================================ */}
      <section className="px-4 sm:px-6 md:px-8 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-heading font-semibold text-primary-700 uppercase tracking-widest">
              {t("home.features.kicker")}
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-neutral-900 leading-[1.1] tracking-tight">
              {t("home.features.title")}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-md">
              {t("home.features.description")}
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Free tokens */}
            <Card className="hover:border-primary-200">
              <div className="space-y-3">
                <div className="bg-primary-50 p-3 rounded-xl w-fit">
                  <Users className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-heading font-bold text-neutral-900">
                  {t("home.features.f1Title")}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t("home.features.f1Desc")}
                </p>
              </div>
            </Card>
            {/* Multiple services */}
            <Card className="hover:border-primary-200">
              <div className="space-y-3">
                <div className="bg-primary-50 p-3 rounded-xl w-fit">
                  <Zap className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-heading font-bold text-neutral-900">
                  {t("home.features.f2Title")}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t("home.features.f2Desc")}
                </p>
              </div>
            </Card>
            {/* Strong security */}
            <Card className="hover:border-primary-200">
              <div className="space-y-3">
                <div className="bg-primary-50 p-3 rounded-xl w-fit">
                  <Lock className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-heading font-bold text-neutral-900">
                  {t("home.features.f3Title")}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t("home.features.f3Desc")}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================
          QUICK ACTIONS — the 3 CTA cards
          ============================================ */}
      <section className="px-4 sm:px-6 md:px-8 py-12 lg:py-16 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900">
              {t("home.actions.title")}
            </h2>
            <p className="mt-2 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
              {t("home.actions.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Get Queue Token */}
            <Card className="hover:border-primary-300 group">
              <div className="p-2 text-center space-y-5">
                <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-heading font-bold text-neutral-900">
                  {t("home.getQueueToken")}
                </h2>
                <p className="text-base text-neutral-600">
                  {t("home.getQueueTokenDesc")}
                </p>
                <Link
                  to="/token/services"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:from-primary-800 hover:via-primary-700 hover:to-primary-600 text-white font-heading font-semibold rounded-lg px-6 py-3.5 transition-all duration-200 w-full text-base shadow-md hover:shadow-lg"
                >
                  {t("home.startQueue")}
                  <Users className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            </Card>

            {/* View Live Queue */}
            <Card className="hover:border-primary-300 group">
              <div className="p-2 text-center space-y-5">
                <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                  <Gauge className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-heading font-bold text-neutral-900">
                  {t("home.viewLiveQueue")}
                </h2>
                <p className="text-base text-neutral-600">
                  {t("home.viewLiveQueueDesc")}
                </p>
                <Link
                  to="/token/monitor"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:from-primary-800 hover:via-primary-700 hover:to-primary-600 text-white font-heading font-semibold rounded-lg px-6 py-3.5 transition-all duration-200 w-full text-base shadow-md hover:shadow-lg"
                >
                  {t("home.viewQueue")}
                  <Gauge className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            </Card>

            {/* Staff Login */}
            <Card className="hover:border-primary-300 group">
              <div className="p-2 text-center space-y-5">
                <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-heading font-bold text-neutral-900">
                  {t("home.staffLogin")}
                </h2>
                <p className="text-base text-neutral-600">
                  {t("home.staffLoginDesc")}
                </p>
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:from-primary-800 hover:via-primary-700 hover:to-primary-600 text-white font-heading font-semibold rounded-lg px-6 py-3.5 transition-all duration-200 w-full text-base shadow-md hover:shadow-lg"
                >
                  {t("home.loginAsStaff")}
                  <Shield className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================
          QR CODE — entry point for visitors
          ============================================ */}
      <section className="px-4 sm:px-6 md:px-8 py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 mb-3">
            {t("home.displayQrCode")}
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 mb-8 max-w-xl mx-auto">
            {t("home.displayQrCodeDesc")}
          </p>

          <Card className="inline-block">
            <div className="p-6 sm:p-8">
              <div className="bg-primary-50 rounded-xl p-6 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? window.location.origin + "/token/services"
                      : ""
                  )}&format=png`}
                  alt="QR code for queue services"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-sm text-neutral-600 mt-6 max-w-sm">
                {t("home.qrInstructions")}
              </p>
            </div>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
