"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown } from "lucide-react";
import { useState } from "react";

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

export default function TopBar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const breadcrumb = breadcrumbMap[pathname] ?? "Dashboard";

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-white px-6">
      <p className="text-sm text-[#64748b]">{breadcrumb}</p>

      <div className="flex items-center gap-4">
        {/* Bell */}
        <button className="relative rounded-full p-2 hover:bg-[#f1f5f9]">
          <Bell size={18} className="text-[#64748b]" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[#0f172a] hover:bg-[#f1f5f9]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] text-xs font-bold text-white">
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
            {userName ?? "User"}
            <ChevronDown size={14} className="text-[#64748b]" />
          </button>

          {open && (
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
