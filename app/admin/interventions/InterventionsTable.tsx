"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, ChevronDown } from "lucide-react";
import NotesModal from "@/app/components/NotesModal";
import { BASE_PATH } from "@/lib/basePath";

type InterventionRow = {
  id:         string;
  entityId:   string;
  entityName: string;
  entityType: string;
  type:       string;
  assignedTo: string;
  dueAt:      Date;
};

type NotesTarget = { entityId: string; entityType: string; entityName: string };

const DEFER_OPTIONS = [
  { label: "2 hours",  value: "2hr"  },
  { label: "4 hours",  value: "4hr"  },
  { label: "1 day",    value: "1d"   },
  { label: "2 days",   value: "2d"   },
  { label: "3 days",   value: "3d"   },
  { label: "5 days",   value: "5d"   },
  { label: "7 days",   value: "7d"   },
  { label: "10 days",  value: "10d"  },
  { label: "14 days",  value: "14d"  },
];

const entityTypeBadge: Record<string, string> = {
  employer: "bg-purple-100 text-purple-700",
  nursery:  "bg-teal-100 text-teal-700",
  employee: "bg-sky-100 text-sky-700",
};

function formatDue(date: Date): string {
  const d        = new Date(date);
  const now      = new Date();
  const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function FilterSelect({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[#64748b]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function InterventionsTable({
  interventions,
  teamMembers,
  highlightId,
}: {
  interventions: InterventionRow[];
  teamMembers:   string[];
  highlightId?:  string;
}) {
  const highlightRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const [completedIds,   setCompletedIds]   = useState<Set<string>>(new Set());
  const [deferredIds,    setDeferredIds]    = useState<Set<string>>(new Set());
  const [openDeferId,    setOpenDeferId]    = useState<string | null>(null);
  const [loadingId,      setLoadingId]      = useState<string | null>(null);
  const [assignments,    setAssignments]    = useState<Record<string, string>>({});
  const [savingAssign,   setSavingAssign]   = useState<string | null>(null);
  const [search,         setSearch]         = useState("");
  const [filterType,     setFilterType]     = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [filterDue,      setFilterDue]      = useState("");
  const [notesTarget,    setNotesTarget]    = useState<NotesTarget | null>(null);

  function getAssigned(row: InterventionRow) {
    return assignments[row.id] ?? row.assignedTo;
  }

  async function handleAssign(id: string, person: string) {
    setAssignments((prev) => ({ ...prev, [id]: person }));
    setSavingAssign(id);
    await fetch(`${BASE_PATH}/api/interventions/${id}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: person }),
    });
    setSavingAssign(null);
    window.dispatchEvent(new Event("halo:refresh-bell"));
  }

  function matchesDue(dueAt: Date): boolean {
    if (!filterDue) return true;
    const d               = new Date(dueAt);
    const now             = new Date();
    const startOfToday    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday); startOfTomorrow.setDate(startOfToday.getDate() + 1);
    const startOfNextWeek = new Date(startOfToday); startOfNextWeek.setDate(startOfToday.getDate() + 7);
    if (filterDue === "overdue")   return d < now;
    if (filterDue === "today")     return d >= startOfToday && d < startOfTomorrow;
    if (filterDue === "tomorrow")  return d >= startOfTomorrow && d < new Date(startOfTomorrow.getTime() + 86_400_000);
    if (filterDue === "this_week") return d >= startOfToday && d < startOfNextWeek;
    return true;
  }

  async function handleComplete(id: string) {
    setLoadingId(id);
    setCompletedIds((prev) => new Set(prev).add(id));
    const res = await fetch(`${BASE_PATH}/api/interventions/${id}/complete`, { method: "PATCH" });
    if (!res.ok) setCompletedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setLoadingId(null);
  }

  async function handleDefer(id: string, deferOption: string) {
    setOpenDeferId(null);
    setDeferredIds((prev) => new Set(prev).add(id));
    const res = await fetch(`${BASE_PATH}/api/interventions/${id}/defer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deferOption }),
    });
    if (!res.ok) setDeferredIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  const now = new Date();

  function matchesSearch(i: InterventionRow) {
    if (!search) return true;
    return i.entityName.toLowerCase().includes(search.toLowerCase()) ||
           i.type.toLowerCase().includes(search.toLowerCase());
  }

  const overdueVisible = interventions.filter((i) => {
    if (deferredIds.has(i.id))    return false;
    if (completedIds.has(i.id))   return false;
    if (new Date(i.dueAt) >= now) return false;
    if (!matchesSearch(i))        return false;
    if (filterType     && i.entityType   !== filterType)     return false;
    if (filterAssigned && getAssigned(i) !== filterAssigned) return false;
    return true;
  });

  const otherVisible = interventions.filter((i) => {
    if (deferredIds.has(i.id))   return false;
    if (completedIds.has(i.id))  return false;
    if (new Date(i.dueAt) < now) return false;
    if (!matchesSearch(i))       return false;
    if (filterType     && i.entityType   !== filterType)     return false;
    if (filterAssigned && getAssigned(i) !== filterAssigned) return false;
    if (!matchesDue(i.dueAt))   return false;
    return true;
  });

  const visible = [...overdueVisible, ...otherVisible];

  return (
    <>
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#f1f5f9] px-6 py-4 space-y-4">
          <input
            placeholder="Search by name or action…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
          <div className="flex gap-4 flex-wrap">
            <FilterSelect label="Type"     options={["employer", "nursery", "employee"]} value={filterType}     onChange={setFilterType}     />
            <FilterSelect label="Assigned" options={teamMembers}                        value={filterAssigned} onChange={setFilterAssigned} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748b]">Due</label>
              <select value={filterDue} onChange={(e) => setFilterDue(e.target.value)}
                className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
                <option value="">All</option>
                <option value="overdue">Overdue</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This week</option>
              </select>
            </div>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-[#64748b]">No interventions match the selected filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
                <th className="px-6 py-3 font-medium">Entity</th>
                <th className="px-6 py-3 font-medium">Action Needed</th>
                <th className="px-6 py-3 font-medium">Due</th>
                <th className="px-6 py-3 font-medium">Assigned</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const isCompleted   = completedIds.has(r.id);
                const isLoading     = loadingId === r.id;
                const deferOpen     = openDeferId === r.id;
                const assigned      = getAssigned(r);
                const isSaving      = savingAssign === r.id;
                const isHighlighted = r.id === highlightId;
                const isOverdue     = new Date(r.dueAt) < now;

                return (
                  <tr
                    key={r.id}
                    ref={isHighlighted ? highlightRef : undefined}
                    className={`border-b last:border-0 transition-colors ${
                      isHighlighted
                        ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
                        : isOverdue
                        ? "border-red-100 bg-red-50 hover:bg-red-100"
                        : "border-[#f8fafc] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className={`font-medium ${isOverdue ? "text-red-700" : "text-[#0f172a]"}`}>{r.entityName}</div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${entityTypeBadge[r.entityType] ?? "bg-gray-100 text-gray-600"}`}>
                        {r.entityType}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${isOverdue ? "text-red-600 font-medium" : "text-[#64748b]"}`}>{r.type}</td>
                    <td className={`px-6 py-4 font-medium ${isOverdue ? "text-red-600" : "text-[#64748b]"}`}>{formatDue(r.dueAt)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={assigned}
                        disabled={isCompleted || isSaving}
                        onChange={(e) => handleAssign(r.id, e.target.value)}
                        className={`rounded-lg border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#3b82f6] ${
                          isSaving
                            ? "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8]"
                            : "border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#3b82f6] cursor-pointer"
                        }`}
                      >
                        {teamMembers.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle size={20} className="text-[#10b981]" />
                        ) : (
                          <button disabled={isLoading} onClick={() => handleComplete(r.id)}
                            className="rounded-lg bg-[#3b82f6] px-3 py-1 text-xs font-medium text-white disabled:opacity-50">
                            Complete
                          </button>
                        )}
                        {!isCompleted && (
                          <div className="relative">
                            {deferOpen && <div className="fixed inset-0 z-40" onClick={() => setOpenDeferId(null)} />}
                            <button disabled={isLoading} onClick={() => setOpenDeferId(deferOpen ? null : r.id)}
                              className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] px-3 py-1 text-xs font-medium text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-50">
                              Defer <ChevronDown size={12} />
                            </button>
                            {deferOpen && (
                              <div className="absolute right-0 top-8 z-50 w-36 rounded-xl border border-[#e2e8f0] bg-white py-1 shadow-lg max-h-48 overflow-y-auto">
                                {DEFER_OPTIONS.map((opt) => (
                                  <button key={opt.value} onClick={() => handleDefer(r.id, opt.value)}
                                    className="block w-full px-4 py-2 text-left text-xs text-[#0f172a] hover:bg-[#f8fafc]">
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => setNotesTarget({ entityId: r.entityId, entityType: r.entityType, entityName: r.entityName })}
                          className="rounded-lg border border-[#e2e8f0] px-3 py-1 text-xs font-medium text-[#64748b] hover:bg-[#f8fafc]"
                        >
                          Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {notesTarget && (
        <NotesModal
          entityId={notesTarget.entityId}
          entityType={notesTarget.entityType}
          entityName={notesTarget.entityName}
          onClose={() => setNotesTarget(null)}
        />
      )}
    </>
  );
}
