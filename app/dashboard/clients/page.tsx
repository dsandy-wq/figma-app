"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import Link from "next/link";

const clients = [
  { name: "Acme Corp",        employer: "Tech Industries",  stage: "Active Onboarding",  status: "On Track" },
  { name: "Bright Solutions", employer: "Finance Group",    stage: "Documentation",      status: "At Risk"  },
  { name: "Crestwood Ltd",    employer: "Healthcare Plus",  stage: "Review & Approval",  status: "On Track" },
  { name: "Delta Partners",   employer: "Legal Associates", stage: "Initial Assessment", status: "Pending"  },
  { name: "Echo Industries",  employer: "Manufacturing Co", stage: "Completion",         status: "Complete" },
  { name: "Falcon Ltd",       employer: "Retail Group",     stage: "Active Onboarding",  status: "On Track" },
  { name: "Global Ventures",  employer: "Consulting Firm",  stage: "Documentation",      status: "At Risk"  },
];

const STAGES    = ["Initial Assessment", "Documentation", "Active Onboarding", "Review & Approval", "Completion"];
const STATUSES  = ["On Track", "At Risk", "Pending", "Complete"];
const EMPLOYERS = [...new Set(clients.map((c) => c.employer))].sort();

const statusColor: Record<string, string> = {
  "On Track": "bg-green-100 text-green-700",
  "At Risk":  "bg-red-100 text-red-700",
  "Pending":  "bg-orange-100 text-orange-700",
  "Complete": "bg-blue-100 text-blue-700",
};

function FilterGroup({
  label, options, active, onChange,
}: {
  label: string;
  options: string[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-[#64748b] w-16 shrink-0">{label}</span>
      <button
        onClick={() => onChange("")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          active === "" ? "bg-[#3b82f6] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
        }`}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(active === opt ? "" : opt)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active === opt ? "bg-[#3b82f6] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ClientsPage() {
  const [search,   setSearch]   = useState("");
  const [stage,    setStage]    = useState("");
  const [status,   setStatus]   = useState("");
  const [employer, setEmployer] = useState("");

  const visible = clients.filter((c) => {
    if (search   && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stage    && c.stage    !== stage)    return false;
    if (status   && c.status   !== status)   return false;
    if (employer && c.employer !== employer) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0f172a]">All Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb]"
        >
          <Users size={16} /> New Client
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="border-b border-[#f1f5f9] px-6 py-4 space-y-3">
          <input
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
          <FilterGroup label="Stage"    options={STAGES}    active={stage}    onChange={setStage}    />
          <FilterGroup label="Status"   options={STATUSES}  active={status}   onChange={setStatus}   />
          <FilterGroup label="Employer" options={EMPLOYERS} active={employer} onChange={setEmployer} />
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
              <th className="px-6 py-3 font-medium">Client Name</th>
              <th className="px-6 py-3 font-medium">Employer</th>
              <th className="px-6 py-3 font-medium">Stage</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#64748b]">
                  No clients match the selected filters.
                </td>
              </tr>
            ) : (
              visible.map((c) => (
                <tr key={c.name} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                  <td className="px-6 py-4 font-medium text-[#0f172a]">{c.name}</td>
                  <td className="px-6 py-4 text-[#64748b]">{c.employer}</td>
                  <td className="px-6 py-4 text-[#64748b]">{c.stage}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[c.status]}`}>
                      {c.status}
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
