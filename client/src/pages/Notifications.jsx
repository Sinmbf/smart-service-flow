import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Clock3, CircleAlert, Info, Megaphone, Trash2, X } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useTranslation } from "react-i18next";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, deleteNotification, deleteAllNotifications } from "../services/tokens";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const TYPE_LABELS = {
  TOKEN_CALLED: "Your turn",
  TURN_APPROACHING: "Turn approaching",
  STAGE_COMPLETED: "Stage update",
  TOKEN_CREATED: "Token update",
};

const iconFor = (type) => {
  if (type === "TOKEN_CALLED") return <Megaphone className="h-5 w-5" />;
  if (type === "TURN_APPROACHING") return <Clock3 className="h-5 w-5" />;
  if (type === "STAGE_COMPLETED") return <CheckCheck className="h-5 w-5" />;
  return <Info className="h-5 w-5" />;
};

const Notifications = () => {
  const { i18n } = useTranslation();
  const isNe = i18n.language === "ne";
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await fetchNotifications({ read: filter, type: typeFilter });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [filter, typeFilter]);

  useEffect(() => {
    setIsLoading(true);
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  const types = useMemo(() => {
    const unique = [...new Set(notifications.map((n) => n.type).filter(Boolean))];
    return unique;
  }, [notifications]);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // best effort
    }
  };

  const markAll = async () => {
    if (!unreadCount) return;
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // best effort
    }
  };

  const removeOne = async (id) => {
    const previous = notifications;
    const target = previous.find((n) => n.id === id);
    setNotifications((current) => current.filter((n) => n.id !== id));
    if (target && !target.read) setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await deleteNotification(id);
    } catch (err) {
      setNotifications(previous);
      setUnreadCount((count) => target && !target.read ? count + 1 : count);
    }
  };

  const removeAll = async () => {
    if (!notifications.length && !unreadCount) return;
    const confirmed = window.confirm("Delete all notifications? This cannot be undone.");
    if (!confirmed) return;
    const previous = notifications;
    const previousUnread = unreadCount;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await deleteAllNotifications();
    } catch {
      setNotifications(previous);
      setUnreadCount(previousUnread);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary-700" />
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold px-1.5">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <p className="mt-1 text-neutral-600">Your recent queue and service notifications.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={markAll} disabled={!unreadCount}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
            <Button type="button" variant="secondary" onClick={removeAll} disabled={!notifications.length && !unreadCount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete all
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 w-fit">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === item.key ? "bg-white shadow-sm text-primary-800" : "text-neutral-600 hover:text-neutral-900"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-h-[42px] rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Notification type"
          >
            <option value="all">All notification types</option>
            {types.map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type] || type.replaceAll("_", " ")}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-5 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-2" role="alert">
            <CircleAlert className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="mt-5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => <div key={n} className="h-24 rounded-2xl bg-neutral-200 animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-10 w-10 mx-auto text-neutral-300" />
              <p className="mt-3 font-semibold text-neutral-800">No notifications found</p>
              <p className="mt-1 text-sm text-neutral-500">New queue updates will appear here automatically.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const title = isNe ? notification.titleNe : notification.titleEn;
                const message = isNe ? notification.messageNe : notification.messageEn;
                return (
                  <article
                    key={notification.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition ${notification.read ? "border-neutral-200 bg-white" : "border-red-200 bg-red-50/60 shadow-sm"}`}
                    onClick={() => !notification.read && markRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-xl p-2.5 ${notification.read ? "bg-neutral-100 text-neutral-600" : "bg-red-100 text-red-700"}`}>
                        {iconFor(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className={`font-semibold ${notification.read ? "text-neutral-900" : "text-neutral-950"}`}>{title}</h2>
                              {!notification.read && <span className="h-2 w-2 rounded-full bg-red-600" aria-label="Unread" />}
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">{message}</p>
                          </div>
                          <div className="flex items-start gap-2 shrink-0">
                            <time className="text-xs text-neutral-500 whitespace-nowrap" dateTime={notification.createdAt}>
                              {new Date(notification.createdAt).toLocaleString(isNe ? "ne-NP" : "en-US")}
                            </time>
                            <button
                              type="button"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-red-600 transition"
                              aria-label="Delete notification"
                              title="Delete notification"
                              onClick={(event) => { event.stopPropagation(); removeOne(notification.id); }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-neutral-500">{TYPE_LABELS[notification.type] || notification.type}</span>
                          {!notification.read && (
                            <button
                              type="button"
                              className="text-xs font-semibold text-primary-700 hover:text-primary-900"
                              onClick={(event) => { event.stopPropagation(); markRead(notification.id); }}
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default Notifications;
