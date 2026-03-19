const stages = [
  { name: "Initial Assessment",  clients: 4,  avgDays: 7,  completion: 22 },
  { name: "Documentation",       clients: 6,  avgDays: 14, completion: 33 },
  { name: "Active Onboarding",   clients: 5,  avgDays: 21, completion: 28 },
  { name: "Review & Approval",   clients: 2,  avgDays: 10, completion: 11 },
  { name: "Completion",          clients: 1,  avgDays: 3,  completion: 6  },
];

const colors = ["#3b82f6", "#10b981", "#7c3aed", "#f59e0b", "#10b981"];

export default function StageProgressionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Stage Progression</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#0f172a]">Clients per Stage</h2>
          <div className="space-y-5">
            {stages.map((s, i) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[#0f172a]">{s.name}</span>
                  <span className="font-semibold text-[#0f172a]">{s.clients} clients</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#f1f5f9]">
                  <div className="h-3 rounded-full" style={{ width: `${s.completion}%`, backgroundColor: colors[i] }} />
                </div>
                <p className="mt-1 text-xs text-[#64748b]">Avg {s.avgDays} days in stage</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {stages.map((s, i) => (
            <div key={s.name} className="rounded-xl bg-white p-5 shadow-sm flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: colors[i] }}>
                {s.clients}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#0f172a] text-sm">{s.name}</p>
                <p className="text-xs text-[#64748b]">Avg {s.avgDays} days • {s.completion}% of pipeline</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
