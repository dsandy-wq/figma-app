"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserPlus, Activity, AlertCircle,
  GitBranch, FileText, CreditCard, UserX, Infinity,
  BookOpen, Calendar, RefreshCw, TrendingUp, Settings, HelpCircle,
} from "lucide-react";
import HaloLogo from "./HaloLogo";

const sections = [
  {
    label: "CLIENTS",
    items: [
      { label: "Dashboard",   href: "/dashboard",              icon: LayoutDashboard },
      { label: "All Clients", href: "/dashboard/clients",      icon: Users },
      { label: "New Client",  href: "/dashboard/clients/new",  icon: UserPlus },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Active Onboardings",  href: "/dashboard/onboardings",   icon: Activity },
      { label: "Interventions Due",   href: "/dashboard/interventions", icon: AlertCircle, badge: true },
      { label: "Stage Gates",         href: "/dashboard/stage-gates",   icon: GitBranch },
      { label: "Task Calendar",       href: "/dashboard/calendar",      icon: Calendar },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Invoice Tracker",  href: "/dashboard/invoices",        icon: FileText },
      { label: "Credit Control",   href: "/dashboard/credit-control",  icon: CreditCard },
      { label: "Non-Payer Log",    href: "/dashboard/non-payers",      icon: UserX },
    ],
  },
  {
    label: "LIFECYCLE",
    items: [
      { label: "Eternal Tracker",     href: "/dashboard/eternal-tracker",   icon: Infinity },
      { label: "All Arrangements",    href: "/dashboard/arrangements",      icon: BookOpen },
      { label: "Quarterly Check-ins", href: "/dashboard/check-ins",         icon: Calendar },
      { label: "Renewals",            href: "/dashboard/renewals",          icon: RefreshCw },
      { label: "Stage Progression",   href: "/dashboard/stage-progression", icon: TrendingUp },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0f1629]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4">
        <HaloLogo size={38} />
        <span className="text-xl font-semibold tracking-wide text-white">Halo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section) => (
          <div key={section.label} className="mt-6">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#475569]">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[#3b82f6] text-white font-medium"
                      : "text-[#94a3b8] hover:bg-[#1e2d45] hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#1e2d45] px-3 py-3">
        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#1e2d45] hover:text-white">
          <Settings size={16} /> Settings
        </Link>
        <Link href="/dashboard/help" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#1e2d45] hover:text-white">
          <HelpCircle size={16} /> Help
        </Link>
      </div>
    </aside>
  );
}
