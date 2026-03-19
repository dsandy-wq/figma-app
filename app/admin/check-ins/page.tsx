import StatCard from "@/app/components/StatCard";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const upcoming = [
  { client: "Acme Corp",        date: "07 Mar 2026", advisor: "Sarah M.", type: "Q1 Review" },
  { client: "Bright Solutions", date: "10 Mar 2026", advisor: "James T.", type: "Q1 Review" },
  { client: "Crestwood Ltd",    date: "12 Mar 2026", advisor: "Sarah M.", type: "6-Month Check" },
  { client: "Delta Partners",   date: "14 Mar 2026", advisor: "Lee R.",   type: "Q1 Review" },
];

export default function CheckInsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Quarterly Check-ins</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm flex flex-col items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-36 h-36">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="16" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="188 126" strokeDashoffset="47" strokeLinecap="round" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="63 251" strokeDashoffset="-141" strokeLinecap="round" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="31 283" strokeDashoffset="-204" strokeLinecap="round" />
            <text x="60" y="56" textAnchor="middle" className="text-2xl font-bold fill-[#0f172a]" fontSize="18" fontWeight="bold">24</text>
            <text x="60" y="72" textAnchor="middle" fontSize="9" fill="#64748b">total</text>
          </svg>
          <div className="mt-4 space-y-1 text-xs w-full">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#10b981]" />Completed <span className="ml-auto font-medium">15</span></div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#f59e0b]" />Scheduled <span className="ml-auto font-medium">5</span></div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ef4444]" />Overdue <span className="ml-auto font-medium">4</span></div>
          </div>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Completed This Quarter" value={15} color="green"  Icon={CheckCircle} />
            <StatCard label="Scheduled"              value={5}  color="orange" Icon={Clock} />
            <StatCard label="Overdue"                value={4}  color="red"    Icon={AlertCircle} />
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#0f172a]">Upcoming Check-ins</h2>
            <div className="space-y-3">
              {upcoming.map((u) => (
                <div key={u.client + u.date} className="flex items-center justify-between rounded-lg border border-[#f1f5f9] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">{u.client}</p>
                    <p className="text-xs text-[#64748b]">{u.type} • {u.advisor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#64748b]">{u.date}</p>
                    <button className="mt-1 text-xs font-medium text-[#3b82f6] hover:underline">Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
