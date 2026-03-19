"use client";

import { useState } from "react";
import { getSlaStatus, NURSERY_STAGES, SLA_DOT } from "@/lib/sla";
import NotesModal from "@/app/components/NotesModal";

type Nursery = {
  id:             string;
  name:           string;
  contactName:    string | null;
  contactEmail:   string | null;
  ofstedNumber:   string | null;
  stage:          string;
  status:         string;
  stageEnteredAt: Date;
};

type NotesTarget = { id: string; name: string };

const STAGES   = ["Signed Up", "Profile Complete", "Verification Pending", "Documents Requested", "Documents Submitted", "Approved", "Agreement Sent", "Live"];
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

export default function NurseriesTable({ nurseries }: { nurseries: Nursery[] }) {
  const [search,      setSearch]      = useState("");
  const [stage,       setStage]       = useState("");
  const [status,      setStatus]      = useState("");
  const [notesTarget, setNotesTarget] = useState<NotesTarget | null>(null);

  const visible = nurseries.filter((n) => {
    if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stage  && n.stage  !== stage)  return false;
    if (status && n.status !== status) return false;
    return true;
  });

  return (
    <>
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#f1f5f9] px-6 py-4 space-y-4">
          <input placeholder="Search nurseries…" value={search} onChange={(e) => setSearch(e.target.value)}
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
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Ofsted No.</th>
              <th className="px-6 py-3 font-medium">Stage</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-[#64748b]">No nurseries match.</td></tr>
            ) : visible.map((n) => {
              const sla = getSlaStatus(n.stage, n.stageEnteredAt, NURSERY_STAGES);
              return (
                <tr key={n.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                  <td className="px-6 py-4">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${SLA_DOT[sla]}`} title={sla} />
                  </td>
                  <td className="px-6 py-4 font-medium text-[#0f172a]">{n.name}</td>
                  <td className="px-6 py-4 text-[#64748b]">
                    <div>{n.contactName ?? "—"}</div>
                    {n.contactEmail && <div className="text-xs text-[#94a3b8]">{n.contactEmail}</div>}
                  </td>
                  <td className="px-6 py-4 text-[#64748b]">{n.ofstedNumber ?? "—"}</td>
                  <td className="px-6 py-4 text-[#64748b]">{n.stage}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[n.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setNotesTarget({ id: n.id, name: n.name })}
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
          entityType="nursery"
          entityName={notesTarget.name}
          onClose={() => setNotesTarget(null)}
        />
      )}
    </>
  );
}
