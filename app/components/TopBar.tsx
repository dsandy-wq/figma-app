"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { BASE_PATH } from "@/lib/basePath";

const breadcrumbMap: Record<string, string> = {
  "/dashboard":                   "Clients / Dashboard",
  "/dashboard/clients":           "Clients / All Clients",
  "/dashboard/clients/new":       "Clients / New Client",
  "/dashboard/onboardings":       "Operations / Active Onboardings",
  "/dashboard/interventions":     "Operations / Interventions Due",
  "/dashboard/stage-gates":       "Operations / Stage Gates",
  "/dashboard/calendar":          "Operations / Task Calendar",
  "/dashboard/invoices":          "Finance / Invoice Tracker",
  "/dashboard/credit-control":    "Finance / Credit Control",
  "/dashboard/non-payers":        "Finance / Non-Payer Log",
  "/dashboard/eternal-tracker":   "Lifecycle / Eternal Tracker",
  "/dashboard/arrangements":      "Lifecycle / All Arrangements",
  "/dashboard/check-ins":         "Lifecycle / Quarterly Check-ins",
  "/dashboard/renewals":          "Lifecycle / Renewals",
  "/dashboard/stage-progression": "Lifecycle / Stage Progression",
};

type TaskRow = {
  id:         string;
  entityName: string;
  entityType: string;
  type:       string;
  assignedTo: string;
  dueAt:      string;
  isOverdue:  boolean;
};

const entityColor: Record<string, string> = {
  employer: "bg-purple-100 text-purple-700",
  nursery:  "bg-teal-100 text-teal-700",
  employee: "bg-sky-100 text-sky-700",
};

export default function TopBar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const breadcrumb = breadcrumbMap[pathname] ?? "Dashboard";

  const [userOpen, setUserOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [overdue,  setOverdue]  = useState<TaskRow[]>([]);
  const [today,    setToday]    = useState<TaskRow[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchTasks = useCallback(() => {
    const qs = userName ? `?assignedTo=${encodeURIComponent(userName)}` : "";
    fetch(`${BASE_PATH}/api/interventions/today${qs}`)
      .then((r) => r.json())
      .then((data) => { setOverdue(data.overdue ?? []); setToday(data.today ?? []); });
  }, [userName]);

  // Load on mount for badge count
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Re-fetch every time the bell opens so count is fresh
  useEffect(() => { if (bellOpen) fetchTasks(); }, [bellOpen, fetchTasks]);

  // Re-fetch badge when an assignment changes anywhere on the page
  useEffect(() => {
    window.addEventListener("halo:refresh-bell", fetchTasks);
    return () => window.removeEventListener("halo:refresh-bell", fetchTasks);
  }, [fetchTasks]);

  // Close bell panel on outside click
  useEffect(() => {
    if (!bellOpen) return;
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const totalCount = overdue.length + today.length;

  function goToTask(id: string) {
    setBellOpen(false);
    router.push(`/dashboard/interventions?highlight=${id}`);
  }

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-white px-6">
      <p className="text-sm text-[#64748b]">{breadcrumb}</p>

      <div className="flex items-center gap-4">
        {/* Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => { setBellOpen((o) => !o); setUserOpen(false); }}
            className="relative rounded-full p-2 hover:bg-[#f1f5f9]"
          >
            <Bell size={18} className="text-[#64748b]" />
            {totalCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[#e2e8f0] bg-white shadow-xl overflow-hidden">
              <div className="border-b border-[#f1f5f9] px-4 py-3">
                <p className="text-xs font-semibold text-[#0f172a]">Today&apos;s Tasks</p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {totalCount === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-[#94a3b8]">No tasks due today.</p>
                ) : (
                  <>
                    {overdue.length > 0 && (
                      <>
                        <div className="flex items-center gap-1.5 bg-red-50 px-4 py-2">
                          <AlertTriangle size={11} className="text-red-500" />
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600">Overdue</span>
                        </div>
                        {overdue.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => goToTask(t.id)}
                            className="flex w-full flex-col gap-0.5 border-b border-[#fef2f2] bg-red-50 px-4 py-3 text-left hover:bg-red-100 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-red-700 truncate">{t.entityName}</span>
                              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${entityColor[t.entityType] ?? "bg-gray-100 text-gray-600"}`}>
                                {t.entityType}
                              </span>
                            </div>
                            <span className="text-[11px] text-red-500 truncate">{t.type}</span>
                            <span className="text-[10px] text-red-400">{t.assignedTo}</span>
                          </button>
                        ))}
                      </>
                    )}

                    {today.length > 0 && (
                      <>
                        <div className="bg-[#f8fafc] px-4 py-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">Due Today</span>
                        </div>
                        {today.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => goToTask(t.id)}
                            className="flex w-full flex-col gap-0.5 border-b border-[#f1f5f9] px-4 py-3 text-left hover:bg-[#f8fafc] transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-[#0f172a] truncate">{t.entityName}</span>
                              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${entityColor[t.entityType] ?? "bg-gray-100 text-gray-600"}`}>
                                {t.entityType}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#64748b] truncate">{t.type}</span>
                            <span className="text-[10px] text-[#94a3b8]">{t.assignedTo}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-[#f1f5f9] px-4 py-2.5">
                <button
                  onClick={() => { setBellOpen(false); router.push("/dashboard/interventions"); }}
                  className="text-xs font-medium text-[#3b82f6] hover:underline"
                >
                  View all interventions →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => { setUserOpen((o) => !o); setBellOpen(false); }}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[#0f172a] hover:bg-[#f1f5f9]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] text-xs font-bold text-white">
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
            {userName ?? "User"}
            <ChevronDown size={14} className="text-[#64748b]" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[#e2e8f0] bg-white py-1 shadow-lg">
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#fef2f2]"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
