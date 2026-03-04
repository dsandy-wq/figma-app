"use client";

import { useState } from "react";
import { CheckCircle, ChevronDown } from "lucide-react";

type InterventionRow = {
  id: string;
  type: string;
  priority: string;
  assignedTo: string;
  dueAt: Date;
  client: { name: string; stage: string };
};

const DEFER_OPTIONS = [
  { label: "2 hours",  value: "2hr" },
  { label: "4 hours",  value: "4hr" },
  { label: "1 day",    value: "1d"  },
  { label: "2 days",   value: "2d"  },
  { label: "3 days",   value: "3d"  },
  { label: "5 days",   value: "5d"  },
  { label: "7 days",   value: "7d"  },
  { label: "10 days",  value: "10d" },
  { label: "14 days",  value: "14d" },
];

const priorityColor: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  LOW:    "bg-green-100 text-green-700",
};

function formatDue(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function InterventionsTable({ interventions }: { interventions: InterventionRow[] }) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [deferredIds,  setDeferredIds]  = useState<Set<string>>(new Set());
  const [openDeferId,  setOpenDeferId]  = useState<string | null>(null);
  const [loadingId,    setLoadingId]    = useState<string | null>(null);

  async function handleComplete(id: string) {
    setLoadingId(id);
    setCompletedIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/interventions/${id}/complete`, { method: "PATCH" });
      if (!res.ok) {
        setCompletedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDefer(id: string, deferOption: string) {
    setOpenDeferId(null);
    setDeferredIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/interventions/${id}/defer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deferOption }),
      });
      if (!res.ok) {
        setDeferredIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    } catch {
      setDeferredIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  const visible = interventions.filter((i) => !deferredIds.has(i.id));

  if (visible.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-[#64748b]">No interventions due right now.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
            <th className="px-6 py-3 font-medium">Client</th>
            <th className="px-6 py-3 font-medium">Type</th>
            <th className="px-6 py-3 font-medium">Due</th>
            <th className="px-6 py-3 font-medium">Priority</th>
            <th className="px-6 py-3 font-medium">Assigned</th>
            <th className="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => {
            const isCompleted = completedIds.has(r.id);
            const isLoading   = loadingId === r.id;
            const deferOpen   = openDeferId === r.id;

            return (
              <tr key={r.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                <td className="px-6 py-4 font-medium text-[#0f172a]">{r.client.name}</td>
                <td className="px-6 py-4 text-[#64748b]">{r.type}</td>
                <td className="px-6 py-4 text-[#64748b]">{formatDue(r.dueAt)}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[r.priority] ?? "bg-gray-100 text-gray-600"}`}>
                    {r.priority.charAt(0) + r.priority.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#64748b]">{r.assignedTo}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle size={20} className="text-[#10b981]" />
                    ) : (
                      <button
                        disabled={isLoading}
                        onClick={() => handleComplete(r.id)}
                        className="rounded-lg bg-[#3b82f6] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}

                    {!isCompleted && (
                      <div className="relative">
                        <button
                          disabled={isLoading}
                          onClick={() => setOpenDeferId(deferOpen ? null : r.id)}
                          className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] px-3 py-1 text-xs font-medium text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-50"
                        >
                          Defer <ChevronDown size={12} />
                        </button>

                        {deferOpen && (
                          <div className="absolute right-0 top-8 z-50 w-36 rounded-xl border border-[#e2e8f0] bg-white py-1 shadow-lg max-h-48 overflow-y-auto">
                            {DEFER_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => handleDefer(r.id, opt.value)}
                                className="block w-full px-4 py-2 text-left text-xs text-[#0f172a] hover:bg-[#f8fafc]"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
