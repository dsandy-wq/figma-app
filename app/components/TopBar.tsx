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

  const [userOpen, setUserOpen]       = useState(false);
  const [bellOpen, setBellOpen]       = useState(false);
  const [pwOpen,   setPwOpen]         = useState(false);
  const [pwCurrent, setPwCurrent]     = useState("");
  const [pwNew,     setPwNew]         = useState("");
  const [pwConfirm, setPwConfirm]     = useState("");
  const [pwError,   setPwError]       = useState("");
  const [pwSuccess, setPwSuccess]     = useState(false);
  const [pwLoading, setPwLoading]     = useState(false);

  function openChangePw() { setUserOpen(false); setPwOpen(true); setPwError(""); setPwSuccess(false); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwError("New passwords don't match."); return; }
    if (pwNew.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwLoading(true); setPwError("");
    const res = await fetch(`${BASE_PATH}/api/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
    });
    setPwLoading(false);
    if (res.ok) { setPwSuccess(true); }
    else { const d = await res.json(); setPwError(d.error ?? "Something went wrong."); }
  }
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
            <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-[#e2e8f0] bg-white py-1 shadow-lg">
              <button
                onClick={openChangePw}
                className="w-full px-4 py-2 text-left text-sm text-[#0f172a] hover:bg-[#f1f5f9]"
              >
                Change password
              </button>
              <div className="my-1 border-t border-[#f1f5f9]" />
              <button
                onClick={() => signOut({ callbackUrl: "/admin/ops/signin" })}
                className="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#fef2f2]"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change password modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-8 shadow-2xl">
            <h2 className="text-lg font-semibold text-[#0f172a]">Change password</h2>

            {pwSuccess ? (
              <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700">
                Password updated successfully.
                <button onClick={() => setPwOpen(false)} className="mt-3 block w-full rounded-lg bg-[#0f172a] py-2 text-sm font-medium text-white hover:bg-[#1e293b]">Close</button>
              </div>
            ) : (
              <form onSubmit={handleChangePw} className="mt-4 flex flex-col gap-3">
                <input
                  type="password" placeholder="Current password" required
                  value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)}
                  className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
                />
                <input
                  type="password" placeholder="New password" required
                  value={pwNew} onChange={(e) => setPwNew(e.target.value)}
                  className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
                />
                <input
                  type="password" placeholder="Confirm new password" required
                  value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)}
                  className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
                />
                {pwError && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-700">{pwError}</p>}
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setPwOpen(false)} className="flex-1 rounded-lg border border-[#e2e8f0] py-2.5 text-sm font-medium text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
                  <button type="submit" disabled={pwLoading} className="flex-1 rounded-lg bg-[#3b82f6] py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-50">
                    {pwLoading ? "Saving…" : "Update"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
