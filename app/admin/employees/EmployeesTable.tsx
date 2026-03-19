"use client";

import { useState } from "react";
import { getSlaStatus, EMPLOYEE_STAGES, SLA_DOT } from "@/lib/sla";
import NotesModal from "@/app/components/NotesModal";

type Employee = {
  id:             string;
  firstName:      string;
  lastName:       string;
  email:          string | null;
  employerName:   string | null;
  stage:          string;
  status:         string;
  stageEnteredAt: Date;
};

type NotesTarget = { id: string; name: string };

const STAGES   = ["Invited", "Registered", "Profile Complete", "Employer Confirmed", "Nursery Enquiry Sent", "Arrangement Pending", "Contracts Sent", "Active", "Offboarding"];
const STATUSES = ["On Track", "At Risk", "Pending", "Complete"];

const statusColor: Record<string, string> = {
  "On Track": "bg-green-100 text-green-700",
  "At Risk":  "bg-red-100 text-red-700",
  "Pending":  "bg-orange-100 text-orange-700",
  "Complete": "bg-blue-100 text-blue-700",
};

function FilterGroup({ label, options, active, onChange }: {
  label: string; options: string[]; active: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[#64748b]">{label}</label>
      <select value={active} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function EmployeesTable({ employees }: { employees: Employee[] }) {
  const [search,      setSearch]      = useState("");
  const [stage,       setStage]       = useState("");
  const [status,      setStatus]      = useState("");
  const [notesTarget, setNotesTarget] = useState<NotesTarget | null>(null);

  const visible = employees.filter((e) => {
    const name = `${e.firstName} ${e.lastName}`;
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stage  && e.stage  !== stage)  return false;
    if (status && e.status !== status) return false;
    return true;
  });

  return (
    <>
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#f1f5f9] px-6 py-4 space-y-4">
          <input placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]" />
          <div className="flex gap-4">
            <FilterGroup label="Stage"  options={STAGES}   active={stage}  onChange={setStage}  />
            <FilterGroup label="Status" options={STATUSES} active={status} onChange={setStatus} />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
              <th className="px-6 py-3 font-medium">SLA</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Employer</th>
              <th className="px-6 py-3 font-medium">Stage</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-[#64748b]">No employees match.</td></tr>
            ) : visible.map((e) => {
              const sla  = getSlaStatus(e.stage, e.stageEnteredAt, EMPLOYEE_STAGES);
              const name = `${e.firstName} ${e.lastName}`;
              return (
                <tr key={e.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                  <td className="px-6 py-4">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${SLA_DOT[sla]}`} title={sla} />
                  </td>
                  <td className="px-6 py-4 font-medium text-[#0f172a]">{name}</td>
                  <td className="px-6 py-4 text-[#64748b]">{e.email ?? "—"}</td>
                  <td className="px-6 py-4 text-[#64748b]">{e.employerName ?? "—"}</td>
                  <td className="px-6 py-4 text-[#64748b]">{e.stage}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[e.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setNotesTarget({ id: e.id, name })}
                      className="text-xs font-medium text-[#3b82f6] hover:underline"
                    >
                      Notes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {notesTarget && (
        <NotesModal
          entityId={notesTarget.id}
          entityType="employee"
          entityName={notesTarget.name}
          onClose={() => setNotesTarget(null)}
        />
      )}
    </>
  );
}
