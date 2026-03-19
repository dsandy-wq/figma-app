import StatCard from "@/app/components/StatCard";
import { Users, Clock, CheckCircle } from "lucide-react";

const timeline = [
  { client: "Acme Corp",        start: "Jan 2024", current: "Active Onboarding", months: 14 },
  { client: "Bright Solutions", start: "Mar 2024", current: "Documentation",     months: 12 },
  { client: "Crestwood Ltd",    start: "Jun 2024", current: "Review & Approval", months: 9 },
  { client: "Delta Partners",   start: "Sep 2024", current: "Initial Assessment",months: 6 },
  { client: "Echo Industries",  start: "Dec 2024", current: "Completion",        months: 3 },
];

export default function EternalTrackerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Eternal Tracker</h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Active"            value={18}   color="blue"  Icon={Users} />
        <StatCard label="Avg Duration (months)"   value="9.4"  color="green" Icon={Clock} />
        <StatCard label="Completions This Month"  value={3}    color="purple" Icon={CheckCircle} />
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-[#0f172a]">Client Lifecycle Timeline</h2>
        <div className="space-y-4">
          {timeline.map((t) => (
            <div key={t.client} className="flex items-center gap-4">
              <div className="w-36 text-sm font-medium text-[#0f172a]">{t.client}</div>
              <div className="text-xs text-[#64748b] w-20">{t.start}</div>
              <div className="flex-1 h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div className="h-3 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#7c3aed]" style={{ width: `${Math.min(100, (t.months / 18) * 100)}%` }} />
              </div>
              <div className="text-xs text-[#64748b] w-16 text-right">{t.months}mo</div>
              <div className="w-36 text-xs text-[#64748b]">{t.current}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
