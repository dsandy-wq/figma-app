"use client";

import { useState } from "react";
import StatCard from "@/app/components/StatCard";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

const invoices = [
  { client: "Acme Corp",        amount: 1200, issued: new Date("2025-11-01"), due: new Date("2026-01-01"), status: "Overdue" },
  { client: "Bright Solutions", amount:  850, issued: new Date("2026-01-05"), due: new Date("2026-03-15"), status: "Pending" },
  { client: "Crestwood Ltd",    amount: 2400, issued: new Date("2025-12-10"), due: new Date("2026-02-10"), status: "Paid"    },
  { client: "Delta Partners",   amount:  600, issued: new Date("2026-01-12"), due: new Date("2026-03-20"), status: "Pending" },
  { client: "Echo Industries",  amount: 3100, issued: new Date("2025-12-15"), due: new Date("2026-02-15"), status: "Paid"    },
  { client: "Falcon Ltd",       amount:  750, issued: new Date("2025-11-20"), due: new Date("2026-01-15"), status: "Overdue" },
];

const statusColor: Record<string, string> = {
  Paid:    "bg-green-100 text-green-700",
  Pending: "bg-orange-100 text-orange-700",
  Overdue: "bg-red-100 text-red-700",
};

const TABS = ["All", "Pending", "Overdue", "Paid"];

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function weeksOverdue(due: Date): string {
  const ms = Date.now() - due.getTime();
  if (ms <= 0) return "—";
  const weeks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
  return weeks < 1 ? "< 1 week" : `${weeks} week${weeks === 1 ? "" : "s"}`;
}

function fmtGBP(n: number) {
  return "£" + n.toLocaleString("en-GB");
}

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState("All");

  const visible = activeTab === "All"
    ? invoices
    : invoices.filter((r) => r.status === activeTab);

  const totalOutstanding = invoices
    .filter((r) => r.status !== "Paid")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Invoice Tracker</h1>

      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#64748b]">Total Outstanding</p>
        <p className="mt-1 text-5xl font-bold text-[#0f172a]">{fmtGBP(totalOutstanding)}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Issued"  value={fmtGBP(invoices.reduce((s, r) => s + r.amount, 0))} color="blue"   Icon={FileText} />
        <StatCard label="Paid"          value={fmtGBP(invoices.filter(r => r.status === "Paid").reduce((s, r) => s + r.amount, 0))}    color="green"  Icon={CheckCircle} />
        <StatCard label="Pending"       value={fmtGBP(invoices.filter(r => r.status === "Pending").reduce((s, r) => s + r.amount, 0))} color="orange" Icon={Clock} />
        <StatCard label="Overdue"       value={fmtGBP(invoices.filter(r => r.status === "Overdue").reduce((s, r) => s + r.amount, 0))} color="red"    Icon={AlertCircle} />
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="flex gap-1 border-b border-[#f1f5f9] px-6 py-3">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === t ? "bg-[#3b82f6] text-white" : "text-[#64748b] hover:bg-[#f1f5f9]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Issued</th>
              <th className="px-6 py-3 font-medium">Due</th>
              <th className="px-6 py-3 font-medium">Weeks Overdue</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#64748b]">
                  No invoices in this category.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.client} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                  <td className="px-6 py-4 font-medium text-[#0f172a]">{r.client}</td>
                  <td className="px-6 py-4 text-[#0f172a]">{fmtGBP(r.amount)}</td>
                  <td className="px-6 py-4 text-[#64748b]">{fmt(r.issued)}</td>
                  <td className="px-6 py-4 text-[#64748b]">{fmt(r.due)}</td>
                  <td className="px-6 py-4">
                    {r.status === "Overdue" ? (
                      <span className="font-medium text-red-600">{weeksOverdue(r.due)}</span>
                    ) : (
                      <span className="text-[#cbd5e1]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-medium text-[#3b82f6] hover:underline">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
