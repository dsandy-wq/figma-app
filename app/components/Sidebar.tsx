"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Home, Users, Activity, AlertCircle,
  GitBranch, FileText, CreditCard, UserX, Infinity,
  BookOpen, Calendar, RefreshCw, TrendingUp, Settings, HelpCircle,
} from "lucide-react";
import HaloLogo from "./HaloLogo";

const sections = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",  href: "/admin",              icon: LayoutDashboard },
    ],
  },
  {
    label: "JOURNEYS",
    items: [
      { label: "Employers",  href: "/admin/employers",  icon: Building2 },
      { label: "Nurseries",  href: "/admin/nurseries",  icon: Home },
      { label: "Employees",  href: "/admin/employees",  icon: Users },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Active Onboardings",  href: "/admin/onboardings",   icon: Activity },
      { label: "Interventions Due",   href: "/admin/interventions", icon: AlertCircle, badge: true },
      { label: "Stage Gates",         href: "/admin/stage-gates",   icon: GitBranch },
      { label: "Task Calendar",       href: "/admin/calendar",      icon: Calendar },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Invoice Tracker",  href: "/admin/invoices",        icon: FileText },
      { label: "Credit Control",   href: "/admin/credit-control",  icon: CreditCard },
      { label: "Non-Payer Log",    href: "/admin/non-payers",      icon: UserX },
    ],
  },
  {
    label: "LIFECYCLE",
    items: [
      { label: "Eternal Tracker",     href: "/admin/eternal-tracker",   icon: Infinity },
      { label: "All Arrangements",    href: "/admin/arrangements",      icon: BookOpen },
      { label: "Quarterly Check-ins", href: "/admin/check-ins",         icon: Calendar },
      { label: "Renewals",            href: "/admin/renewals",          icon: RefreshCw },
      { label: "Stage Progression",   href: "/admin/stage-progression", icon: TrendingUp },
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
        <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#1e2d45] hover:text-white">
          <Settings size={16} /> Settings
        </Link>
        <Link href="/admin/help" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#1e2d45] hover:text-white">
          <HelpCircle size={16} /> Help
        </Link>
      </div>
    </aside>
  );
}
