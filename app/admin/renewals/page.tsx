import StatCard from "@/app/components/StatCard";
import { RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react";

const renewals = [
  { client: "Acme Corp",        due: "31 Mar 2026", value: "£1,200/mo", status: "Due Soon", probability: 85 },
  { client: "Bright Solutions", due: "15 Apr 2026", value: "£850/mo",  status: "At Risk",  probability: 40 },
  { client: "Crestwood Ltd",    due: "30 Apr 2026", value: "£2,400/mo", status: "On Track", probability: 92 },
  { client: "Delta Partners",   due: "31 May 2026", value: "£600/mo",  status: "On Track", probability: 78 },
];

const statusColor: Record<string, string> = {
  "Due Soon": "bg-orange-100 text-orange-700",
  "At Risk":  "bg-red-100 text-red-700",
  "On Track": "bg-green-100 text-green-700",
};

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const values = [3, 5, 4, 7, 6, 8];
const max = Math.max(...values);

export default function RenewalsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Renewals</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Due This Month" value={4}  color="orange" Icon={RefreshCw} />
        <StatCard label="Renewed YTD"   value={12} color="green"  Icon={CheckCircle} />
        <StatCard label="At Risk"       value={3}  color="red"    Icon={AlertCircle} />
        <StatCard label="Lost YTD"      value={1}  color="purple" Icon={XCircle} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#0f172a]">Renewals This Period</h2>
          <div className="flex items-end gap-3 h-36">
            {months.map((m, i) => (
              <div key={m} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-[#3b82f6]" style={{ height: `${(values[i] / max) * 100}%` }} />
                <span className="text-xs text-[#64748b]">{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Prob.</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((r) => (
                <tr key={r.client} className="border-b border-[#f8fafc] last:border-0">
                  <td className="px-4 py-3 font-medium text-[#0f172a]">{r.client}</td>
                  <td className="px-4 py-3 text-[#64748b]">{r.due}</td>
                  <td className="px-4 py-3 text-[#0f172a]">{r.value}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-[#64748b]">{r.probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
