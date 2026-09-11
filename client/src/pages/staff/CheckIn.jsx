import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Hash, CheckCircle2, AlertCircle } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import { searchStaffTokens } from "../../services/staff";

const SearchTokens = () => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setError(""); return undefined; }
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try { const data = await searchStaffTokens(q); setResults(data.tokens || []); }
      catch (err) { setError(err.response?.data?.message || t("staff.checkIn.searchFailed", "Could not search tokens.")); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, t]);
  const statusLabel = (s) => ({ WAITING: t("staff.queue.waiting", "Waiting"), CALLED: t("staff.queue.called", "Called"), SERVING: t("staff.queue.serving", "Serving"), CHECKED_IN: t("staff.queue.serving", "Serving") }[s] || s);
  return <MainLayout><div className="max-w-3xl mx-auto py-4">
    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900">{t("staff.checkIn.title", "Token Search")}</h1>
    <p className="mt-2 text-neutral-600">{t("staff.checkIn.subtitle", "Search for a token number in your government office queue.")}</p>
    <Card className="mt-6 p-6">
      <label className="block text-sm font-medium text-neutral-700 mb-2">{t("staff.checkIn.identifierLabel", "Token number")}</label>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("staff.checkIn.identifierPlaceholder", "Search token number, e.g. D4A001")} className="w-full pl-9 pr-3 py-3 border border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" autoFocus /></div>
      <p className="mt-2 text-xs text-neutral-500">{t("staff.checkIn.searchHint", "Search only. Check-in is performed from the Called queue when the citizen arrives at the counter.")}</p>
    </Card>
    {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2"><AlertCircle className="h-5 w-5"/><span>{error}</span></div>}
    {query && <div className="mt-5 space-y-2">{loading ? <p className="text-sm text-neutral-500">{t("common.loading","Searching…")}</p> : results.length===0 ? <Card className="p-5 text-sm text-neutral-500">{t("staff.checkIn.noResults","No matching active tokens found in your office.")}</Card> : results.map(token => <Card key={token.id} className="p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-semibold text-neutral-900 text-lg"><Hash className="inline h-4 w-4 mr-1"/>{token.tokenNumber}</div><div className="text-sm text-neutral-600">{token.user?.name || "Citizen"}{token.user?.phoneNumber ? ` · ${token.user.phoneNumber}` : ""}</div><div className="text-xs text-neutral-500 mt-1">{i18n.language === "ne" ? token.service?.nameNe : token.service?.nameEn} · {i18n.language === "ne" ? token.currentStage?.nameNe : token.currentStage?.nameEn}</div></div><div className="flex items-center gap-1 text-xs font-semibold text-primary-700"><CheckCircle2 className="h-4 w-4"/>{statusLabel(token.status)}</div></div></Card>)}</div>}
  </div></MainLayout>;
};
export default SearchTokens;
