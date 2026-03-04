"use client";

import { useState } from "react";
import { CheckCircle, Mail, Phone, FileWarning, Scale } from "lucide-react";

type Client = {
  name: string;
  amount: string;
  daysOverdue: number;
  stage: number;
};

const clients: Client[] = [
  { name: "Acme Corp",  amount: "£1,200", daysOverdue: 14, stage: 3 },
  { name: "Falcon Ltd", amount: "£750",   daysOverdue: 8,  stage: 3 },
];

const COMMS = [
  {
    id: "reminder",
    label: "Payment Reminder",
    icon: Mail,
    style:   "border-blue-200   bg-blue-50   text-blue-700",
    sentStyle: "border-blue-500   bg-blue-500   text-white",
  },
  {
    id: "overdue",
    label: "Overdue Notice",
    icon: FileWarning,
    style:   "border-orange-200 bg-orange-50 text-orange-700",
    sentStyle: "border-orange-500 bg-orange-500 text-white",
  },
  {
    id: "final",
    label: "Final Demand",
    icon: Mail,
    style:   "border-red-200    bg-red-50    text-red-700",
    sentStyle: "border-red-500    bg-red-500    text-white",
  },
  {
    id: "phone",
    label: "Log Phone Call",
    icon: Phone,
    style:   "border-[#e2e8f0]  bg-[#f8fafc] text-[#475569]",
    sentStyle: "border-[#475569]  bg-[#475569]  text-white",
  },
  {
    id: "legal",
    label: "Refer to Recovery",
    icon: Scale,
    style:   "border-purple-200 bg-purple-50 text-purple-700",
    sentStyle: "border-purple-500 bg-purple-500 text-white",
  },
] as const;

const STAGES = [
  "Initial Invoice",
  "7-Day Reminder",
  "Overdue Notice",
  "Phone Follow-up",
  "Final Demand",
  "Legal / Recovery",
];

export default function CreditControlPage() {
  // Track sent comms: Set of "clientName::commId"
  const [sent, setSent] = useState<Set<string>>(new Set());

  function handleSend(clientName: string, commId: string) {
    setSent((prev) => new Set(prev).add(`${clientName}::${commId}`));
  }

  function isSent(clientName: string, commId: string) {
    return sent.has(`${clientName}::${commId}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Credit Control</h1>

      {/* Stage reference strip */}
      <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#64748b]">Recovery Stages</p>
        <div className="flex items-center gap-0">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f5f9] text-xs font-bold text-[#64748b]">
                  {i + 1}
                </div>
                <p className="mt-1 max-w-[72px] text-center text-[10px] leading-tight text-[#64748b]">{s}</p>
              </div>
              {i < STAGES.length - 1 && (
                <div className="mx-1 mb-4 h-px w-8 bg-[#e2e8f0]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Client table with action tiles */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Days Overdue</th>
              <th className="px-6 py-3 font-medium">Stage</th>
              <th className="px-6 py-3 font-medium">Issue Comms</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.name} className="border-b border-[#f8fafc] last:border-0 align-top hover:bg-[#fafcff]">
                <td className="px-6 py-4 font-medium text-[#0f172a]">{c.name}</td>
                <td className="px-6 py-4 font-semibold text-[#ef4444]">{c.amount}</td>
                <td className="px-6 py-4 text-[#64748b]">{c.daysOverdue} days</td>
                <td className="px-6 py-4 text-[#64748b]">
                  Step {c.stage} — {STAGES[c.stage - 1]}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {COMMS.map((comm) => {
                      const done = isSent(c.name, comm.id);
                      const Icon = comm.icon;
                      return (
                        <button
                          key={comm.id}
                          onClick={() => !done && handleSend(c.name, comm.id)}
                          disabled={done}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            done ? comm.sentStyle + " cursor-default" : comm.style + " hover:opacity-80"
                          }`}
                        >
                          {done
                            ? <CheckCircle size={12} />
                            : <Icon size={12} />
                          }
                          {comm.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
