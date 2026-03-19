const nonPayers = [
  { client: "Acme Corp",     owed: "£1,200", daysOverdue: 14, lastContact: "28 Feb 2026", status: "In Recovery" },
  { client: "Falcon Ltd",    owed: "£750",   daysOverdue: 8,  lastContact: "02 Mar 2026", status: "Contacted" },
  { client: "Horizon Group", owed: "£3,400", daysOverdue: 42, lastContact: "10 Jan 2026", status: "Legal" },
];

const statusColor: Record<string, string> = {
  "In Recovery": "bg-orange-100 text-orange-700",
  "Contacted":   "bg-blue-100 text-blue-700",
  "Legal":       "bg-red-100 text-red-700",
};

export default function NonPayersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Non-Payer Log</h1>
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Amount Owed</th>
              <th className="px-6 py-3 font-medium">Days Overdue</th>
              <th className="px-6 py-3 font-medium">Last Contact</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {nonPayers.map((r) => (
              <tr key={r.client} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                <td className="px-6 py-4 font-medium text-[#0f172a]">{r.client}</td>
                <td className="px-6 py-4 font-semibold text-[#ef4444]">{r.owed}</td>
                <td className="px-6 py-4 text-[#64748b]">{r.daysOverdue} days</td>
                <td className="px-6 py-4 text-[#64748b]">{r.lastContact}</td>
                <td className="px-6 py-4"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>{r.status}</span></td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="rounded-lg bg-[#3b82f6] px-3 py-1 text-xs font-medium text-white">Log Contact</button>
                  <button className="rounded-lg border border-[#e2e8f0] px-3 py-1 text-xs font-medium text-[#64748b]">Escalate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
