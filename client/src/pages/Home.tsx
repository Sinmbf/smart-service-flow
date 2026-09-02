import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Zap,
  Lock,
  ArrowRight,
  Check,
  QrCode,
  Activity,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";

const Home = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      {/* ============================================
          HERO — Editorial split with diagonal gradient
          ============================================ */}
      <section className="relative overflow-hidden bg-white">
        {/* Diagonal mint gradient bleed — desktop only */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-2/3 hidden lg:block"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, transparent 35%, #EAF4F5 35%, #CFE3E6 70%, #A4CDD2 100%)",
          }}
          aria-hidden="true"
        />
        {/* Mobile subtle gradient */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, #EAF4F5 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />
        {/* Floating blur orbs */}
        <div
          className="pointer-events-none absolute top-32 right-32 w-72 h-72 rounded-full opacity-20 blur-3xl hidden lg:block"
          style={{ background: "radial-gradient(circle, #0F4C5C 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* LEFT — Editorial headline + CTA */}
            <div className="lg:col-span-7 relative z-10 order-2 lg:order-1 text-center lg:text-left">
              {/* Status pill — minimal */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-primary-200 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-700"></span>
                </span>
                <span className="text-xs font-semibold text-primary-800 tracking-wide uppercase">
                  Live · Government Services
                </span>
              </div>

              {/* Massive editorial headline */}
              <h1 className="mt-6 sm:mt-8 font-heading font-bold text-neutral-900 tracking-[-0.04em] leading-[0.95] text-[2.5rem] sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem]">
                <span className="block">Queue</span>
                <span className="block text-primary-700 italic">online.</span>
                <span className="block text-neutral-900 text-2xl sm:text-4xl lg:text-5xl mt-2 lg:mt-4 font-semibold tracking-tight">
                  Visit when ready.
                </span>
              </h1>

              <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t("home.hero.subheadline")}
              </p>

              {/* Single direct CTA — no email field */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/token/services"
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all group touch-manipulation"
                  style={{ color: "#ffffff" }}
                >
                  <span>Get a Token</span>
                  <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link
                  to="/token/monitor"
                  className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 font-semibold rounded-2xl transition-all group touch-manipulation"
                >
                  <Activity className="h-5 w-5 text-neutral-500" />
                  <span>View Live Queue</span>
                </Link>
              </div>

              {/* Trust signal — single, restrained */}
              <div className="mt-8 sm:mt-10 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-neutral-500">
                <div className="flex -space-x-2 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-300 to-teal-600 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 border-2 border-white"></div>
                </div>
                <p className="text-left">
                  <span className="font-semibold text-neutral-900">12,400+</span> tokens issued this week
                </p>
              </div>
            </div>

            {/* RIGHT — Decorative queue status card (no CTA inside) */}
            <div className="lg:col-span-5 relative z-10 order-1 lg:order-2 mb-4 lg:mb-0">
              <div className="relative max-w-sm mx-auto">
                {/* Floating accent back-card */}
                <div
                  className="absolute -top-4 -left-4 sm:-top-6 sm:-left-8 w-32 h-40 sm:w-44 sm:h-56 rounded-3xl shadow-2xl rotate-[-6deg] hidden sm:block"
                  style={{
                    background: "linear-gradient(160deg, #0F4C5C 0%, #1F6F7A 100%)",
                  }}
                  aria-hidden="true"
                >
                  <div className="p-4 sm:p-5 h-full flex flex-col justify-between text-white">
                    <div>
                      <p className="text-[10px] font-semibold text-primary-200 uppercase tracking-widest">
                        Counter
                      </p>
                      <p className="text-base sm:text-lg font-bold mt-2">Counter 04</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-primary-200 uppercase">Now Serving</p>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight">A024</p>
                    </div>
                  </div>
                </div>

                {/* Main hero card — status display, no CTA */}
                <div className="relative bg-white rounded-3xl shadow-2xl border border-neutral-100 p-5 sm:p-7 lg:p-8">
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-neutral-900 p-2.5 rounded-xl flex-shrink-0">
                        <ShieldCheck className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate">
                          {t("home.hero.cardIssuer")}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">citizen@gov.example</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-emerald-700">Active</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-5 sm:pt-6">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                      {t("home.hero.cardLabel")}
                    </p>
                    <p className="mt-2 text-5xl sm:text-6xl font-bold text-neutral-900 tracking-tight tabular-nums">
                      A024
                    </p>
                    <p className="mt-2 text-sm text-neutral-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      April 21, 2026 · 14:32
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-6 space-y-2.5">
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border-2 border-neutral-900 bg-neutral-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                        <span className="text-sm font-semibold text-neutral-900 truncate">
                          {t("home.hero.cardService1")}
                        </span>
                      </div>
                      <Check className="h-4 w-4 text-neutral-900 flex-shrink-0" strokeWidth={3} />
                    </div>
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-neutral-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-neutral-300 flex-shrink-0"></div>
                        <span className="text-sm font-semibold text-neutral-700 truncate">
                          {t("home.hero.cardService2")}
                        </span>
                      </div>
                      <div className="h-4 w-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MARQUEE — Trust strip, single line editorial
          ============================================ */}
      <section className="relative border-y border-neutral-200 bg-neutral-50 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-3">
            {[
              t("home.trust.gov"),
              t("home.trust.public"),
              t("home.trust.digital"),
              t("home.trust.national"),
            ].map((label, i) => (
              <span
                key={i}
                className="text-sm sm:text-base font-bold text-neutral-400 tracking-[0.2em] uppercase"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES — Asymmetric editorial layout
          ============================================ */}
      <section className="relative bg-white py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Section header — left, sticky on desktop */}
            <div className="lg:col-span-5 lg:sticky lg:top-12 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 mb-5 sm:mb-6">
                <Sparkles className="h-4 w-4 text-primary-700" />
                <p className="text-xs font-bold text-primary-700 uppercase tracking-[0.2em]">
                  {t("home.features.kicker")}
                </p>
              </div>
              <h2 className="font-heading font-bold text-neutral-900 tracking-[-0.03em] leading-[1.05] text-3xl sm:text-4xl lg:text-6xl">
                {t("home.features.title")}
              </h2>
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-neutral-600 max-w-md mx-auto sm:mx-0 leading-relaxed">
                {t("home.features.description")}
              </p>
            </div>

            {/* Feature cards — right, stacked with offset */}
            <div className="lg:col-span-7 space-y-5">
              {[
                {
                  icon: Users,
                  title: t("home.features.f1Title"),
                  desc: t("home.features.f1Desc"),
                  tag: "01",
                },
                {
                  icon: Zap,
                  title: t("home.features.f2Title"),
                  desc: t("home.features.f2Desc"),
                  tag: "02",
                },
                {
                  icon: Lock,
                  title: t("home.features.f3Title"),
                  desc: t("home.features.f3Desc"),
                  tag: "03",
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="group relative bg-white border border-neutral-200 hover:border-neutral-300 rounded-3xl p-5 sm:p-7 lg:p-8 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="flex-shrink-0">
                        <div className="bg-neutral-100 group-hover:bg-neutral-900 p-3.5 sm:p-4 rounded-2xl transition-colors">
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-neutral-700 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
                          <span className="text-xs font-bold text-neutral-300 tabular-nums">
                            {feature.tag}
                          </span>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 tracking-tight">
                            {feature.title}
                          </h3>
                        </div>
                        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          QUICK ACTIONS — Bento-style, asymmetric
          ============================================ */}
      <section className="relative bg-neutral-50 py-16 sm:py-20 lg:py-32 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mb-10 sm:mb-16 text-center sm:text-left">
            <p className="text-xs font-bold text-primary-700 uppercase tracking-[0.2em] mb-4">
              Get Started
            </p>
            <h2 className="font-heading font-bold text-neutral-900 tracking-[-0.03em] leading-[1.05] text-3xl sm:text-4xl lg:text-5xl">
              {t("home.actions.title")}
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-600">
              {t("home.actions.subtitle")}
            </p>
          </div>

          {/* Bento grid — first card spans 2 columns on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Primary — Get Token, large */}
            <Link
              to="/token/services"
              className="group md:col-span-2 relative overflow-hidden rounded-3xl bg-primary-700 hover:bg-primary-800 p-6 sm:p-8 lg:p-10 min-h-[240px] sm:min-h-[280px] flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
              style={{ color: "#ffffff" }}
            >
              <div className="relative">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: "#ffffff" }} />
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-[0.2em] text-white/80"
                  >
                    Citizen
                  </span>
                </div>
                <h3
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  {t("home.getQueueToken")}
                </h3>
                <p
                  className="mt-2 sm:mt-3 text-sm sm:text-base max-w-md text-white/90"
                >
                  {t("home.getQueueTokenDesc")}
                </p>
              </div>
              <div
                className="relative flex items-center gap-2 text-sm font-semibold mt-5 sm:mt-6"
                style={{ color: "#ffffff" }}
              >
                <span>{t("home.startQueue")}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* View Live Queue */}
            <Link
              to="/token/monitor"
              className="group relative overflow-hidden rounded-3xl bg-white border border-neutral-200 hover:border-neutral-300 p-6 sm:p-8 min-h-[240px] sm:min-h-[280px] flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-700 transition-colors" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                    Live
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {t("home.viewLiveQueue")}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {t("home.viewLiveQueueDesc")}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 mt-5 sm:mt-6">
                <span>{t("home.viewQueue")}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Staff Login */}
            <Link
              to="/login"
              className="group relative overflow-hidden rounded-3xl bg-white border border-neutral-200 hover:border-neutral-300 p-6 sm:p-8 min-h-[240px] sm:min-h-[280px] flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-700 transition-colors" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                    Staff
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  {t("home.staffLogin")}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {t("home.staffLoginDesc")}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 mt-5 sm:mt-6">
                <span>{t("home.loginAsStaff")}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* QR — small accent card */}
            <Link
              to="/token/scanner"
              className="group md:col-span-2 relative overflow-hidden rounded-3xl bg-neutral-900 hover:bg-neutral-800 p-6 sm:p-8 lg:p-10 min-h-[240px] sm:min-h-[280px] flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 transition-all"
              style={{ color: "#ffffff" }}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <QrCode className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: "#ffffff" }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Counter Display
                </span>
                <h3
                  className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mt-2"
                  style={{ color: "#ffffff" }}
                >
                  {t("home.displayQrCode")}
                </h3>
                <p
                  className="mt-2 text-sm max-w-lg"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {t("home.displayQrCodeDesc")}
                </p>
              </div>
              <div
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#ffffff" }}
              >
                <span>Open</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          QR — minimal inline section
          ============================================ */}
      <section className="relative bg-white py-16 sm:py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-xs font-bold text-primary-700 uppercase tracking-[0.2em] mb-4">
            Walk-in Access
          </p>
          <h2 className="font-heading font-bold text-neutral-900 tracking-[-0.03em] leading-[1.05] text-4xl sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
            Scan. Join. Wait anywhere.
          </h2>
          <p className="mt-6 text-lg text-neutral-600 max-w-xl mx-auto">
            {t("home.qrInstructions")}
          </p>

          <Card className="mt-12 max-w-sm mx-auto border border-dashed border-neutral-300 shadow-none">
            <div className="p-4">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? window.location.origin + "/token/services"
                      : ""
                  )}&format=png`}
                  alt="QR code for queue services"
                  className="w-48 h-48 object-contain mx-auto"
                  loading="lazy"
                />
              </div>
              <p className="mt-6 text-sm text-neutral-500">
                Point your camera at the code
              </p>
            </div>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
