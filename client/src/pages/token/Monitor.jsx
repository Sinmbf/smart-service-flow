import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout.jsx";
export default function Monitor() {
  const [services, setServices] = useState([]);
  useEffect(() => {
    const i = setInterval(
      () =>
        fetch(import.meta.env.VITE_API_BASE_URL + "/queue/status")
          .then((r) => r.json())
          .then((d) => setServices(d.services || [])),
      3000,
    );
    fetch(import.meta.env.VITE_API_BASE_URL + "/queue/status")
      .then((r) => r.json())
      .then((d) => setServices(d.services || []));
    return () => clearInterval(i);
  }, []);
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-8">
        <h2 className="font-heading text-3xl text-teal-300 mb-6 border-b border-neutral-200 pb-2">
          Queue Monitor
        </h2>
        <div className="flex flex-nowrap gap-4 justify-start ">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white border-t-8 border-primary-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition w-80 shrink-0"
            >
              <div className="mb-2">
                <span className="text-base font-heading font-bold text-neutral-900">
                  {s.name}
                </span>
              </div>
              <div className="text-6xl font-heading font-light text-primary-700 leading-none mb-4">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
                  Currently serving:{" "}
                </span>
                <div className="text-6xl">
                  {s.currentToken != null ? s.currentToken : 0}
                </div>
              </div>
              <div
                className="flex gap-6 text-sm text
              -neutral-500"
              >
                <span>
                  Waiting: <b className="text-neutral-800">{s.waiting ?? 0}</b>
                </span>
                <span>
                  Serving:{" "}
                  <b className="text-neutral-800">{s.currentNumber ?? 0}</b>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
/* ui-styling: card shadow, rounded, teal heading, neutral body */
