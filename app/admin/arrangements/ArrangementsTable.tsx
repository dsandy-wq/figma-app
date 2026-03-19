"use client";

import { useState } from "react";

export type ArrangementRow = {
  id:                      string;
  reference_number:        string;
  status:                  string;
  start_date:              Date | null;
  fee_pence:               number | null;
  child_name:              string | null;
  employer_approved:       boolean;
  employee_approved:       boolean;
  nursery_validated:       boolean;
  contract_addendum_required: boolean;
  addendum_signed:         boolean;
  created_at:              Date;
  employer_name:           string | null;
  nursery_name:            string | null;
  employee_name:           string | null;
  employee_email:          string | null;
};

type Stage = "Awaiting Approval" | "All Approved" | "Addendum Pending" | "Starting Soon" | "Live – Invoiced" | "Cancelled";

const STAGE_ORDER: Stage[] = [
  "Awaiting Approval",
  "All Approved",
  "Addendum Pending",
  "Starting Soon",
  "Live – Invoiced",
  "Cancelled",
];

const STAGE_STYLE: Record<Stage, string> = {
  "Awaiting Approval": "bg-orange-100 text-orange-700",
  "All Approved":      "bg-blue-100 text-blue-700",
  "Addendum Pending":  "bg-amber-100 text-amber-700",
  "Starting Soon":     "bg-purple-100 text-purple-700",
  "Live – Invoiced":   "bg-green-100 text-green-700",
  "Cancelled":         "bg-slate-100 text-slate-500",
};

const STAGE_DOT: Record<Stage, string> = {
  "Awaiting Approval": "bg-orange-400",
  "All Approved":      "bg-blue-400",
  "Addendum Pending":  "bg-amber-400",
  "Starting Soon":     "bg-purple-400",
  "Live – Invoiced":   "bg-green-500",
  "Cancelled":         "bg-slate-300",
};

function deriveStage(row: ArrangementRow): Stage {
  if (row.status === "CANCELLED") return "Cancelled";
  if (!row.employer_approved || !row.employee_approved || !row.nursery_validated) {
    return "Awaiting Approval";
  }
  if (row.contract_addendum_required && !row.addendum_signed) {
    return "Addendum Pending";
  }
  if (row.status === "ACTIVE") {
    const now = new Date();
    const start = row.start_date ? new Date(row.start_date) : null;
    if (start && start > now) return "Starting Soon";
    return "Live – Invoiced";
  }
  return "All Approved";
}

function formatFee(pence: number | null) {
  if (!pence) return "—";
  return `£${(pence / 100).toFixed(0)}/mo`;
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ApprovalPip({ ok, label, description }: { ok: boolean; label: string; description: string }) {
  return (
    <span className="relative group inline-flex">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold cursor-default ${
          ok ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
        }`}
      >
        {ok ? "✓" : "·"}
      </span>
      {/* Tooltip */}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <span className="block rounded-lg bg-[#0f172a] px-3 py-2 text-left shadow-xl">
          <span className="block text-xs font-semibold text-white mb-0.5">{label}</span>
          <span className="block text-[11px] text-[#94a3b8] leading-snug">{description}</span>
          <span className={`mt-1.5 block text-[10px] font-semibold ${ok ? "text-green-400" : "text-amber-400"}`}>
            {ok ? "✓ Complete" : "⏳ Pending"}
          </span>
        </span>
        {/* Arrow */}
        <span className="block w-2.5 h-2.5 bg-[#0f172a] rotate-45 mx-auto -mt-1.5 rounded-sm" />
      </span>
    </span>
  );
}

export default function ArrangementsTable({ rows }: { rows: ArrangementRow[] }) {
  const [search,      setSearch]      = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const withStage = rows.map((r) => ({ ...r, stage: deriveStage(r) }));

  const stageCounts = STAGE_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = withStage.filter((r) => r.stage === s).length;
    return acc;
  }, {});

  const visible = withStage.filter((r) => {
    if (stageFilter && r.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.employee_name?.toLowerCase().includes(q) ||
        r.employer_name?.toLowerCase().includes(q) ||
        r.nursery_name?.toLowerCase().includes(q) ||
        r.reference_number.toLowerCase().includes(q) ||
        r.child_name?.toLowerCase().includes(q) ||
        false
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Pipeline summary */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STAGE_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(stageFilter === s ? "" : s)}
            className={`rounded-xl border px-3 py-3 text-left transition-all ${
              stageFilter === s
                ? "border-[#3b82f6] bg-[#eff6ff] shadow-sm"
                : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`h-2 w-2 rounded-full ${STAGE_DOT[s]}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">{s}</span>
            </div>
            <p className="text-2xl font-bold text-[#0f172a]">{stageCounts[s]}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#f1f5f9] px-6 py-4 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#64748b]">Search</label>
            <input
              placeholder="Name, employer, nursery, ref…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#64748b]">Stage</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            >
              <option value="">All stages</option>
              {STAGE_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="ml-auto text-xs text-[#94a3b8]">{visible.length} arrangement{visible.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Employer</th>
                <th className="px-6 py-3 font-medium">Nursery</th>
                <th className="px-6 py-3 font-medium">Child</th>
                <th className="px-6 py-3 font-medium">Fee</th>
                <th className="px-6 py-3 font-medium">Start Date</th>
                <th className="px-6 py-3 font-medium">Approvals</th>
                <th className="px-6 py-3 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-[#64748b]">
                    No arrangements match.
                  </td>
                </tr>
              ) : visible.map((r) => (
                <tr key={r.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                  <td className="px-6 py-4 font-mono text-xs font-medium text-[#0f172a]">
                    {r.reference_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#0f172a]">{r.employee_name ?? "—"}</div>
                    {r.employee_email && (
                      <div className="text-xs text-[#94a3b8]">{r.employee_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#64748b]">{r.employer_name ?? "—"}</td>
                  <td className="px-6 py-4 text-[#64748b]">{r.nursery_name ?? "—"}</td>
                  <td className="px-6 py-4 text-[#64748b]">{r.child_name ?? "—"}</td>
                  <td className="px-6 py-4 font-medium text-[#0f172a]">{formatFee(r.fee_pence)}</td>
                  <td className="px-6 py-4 text-[#64748b]">{formatDate(r.start_date)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <ApprovalPip ok={r.employer_approved} label="Employer" description="The employer has reviewed and approved the salary sacrifice arrangement for this employee." />
                      <ApprovalPip ok={r.employee_approved} label="Employee" description="The employee has agreed to the terms of their Halo Pay arrangement." />
                      <ApprovalPip ok={r.nursery_validated} label="Nursery" description="The nursery has confirmed the child's place and validated the arrangement details." />
                      {r.contract_addendum_required && (
                        <ApprovalPip ok={r.addendum_signed} label="Addendum" description="The employee has signed the salary sacrifice addendum — the formal legal amendment to their employment contract." />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLE[r.stage]}`}>
                      {r.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
