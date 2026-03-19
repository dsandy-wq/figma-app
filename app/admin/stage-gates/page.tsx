const gates = [
  {
    client: "Acme Corp", stage: "Documentation",
    items: [
      { label: "ID verified",          done: true },
      { label: "Employer letter",       done: true },
      { label: "Bank statements (3mo)", done: false },
      { label: "Signed agreement",      done: false },
    ],
  },
  {
    client: "Bright Solutions", stage: "Active Onboarding",
    items: [
      { label: "Welcome pack sent",     done: true },
      { label: "System access granted", done: true },
      { label: "Induction scheduled",   done: true },
      { label: "First check-in done",   done: false },
    ],
  },
  {
    client: "Crestwood Ltd", stage: "Review & Approval",
    items: [
      { label: "Compliance check",      done: true },
      { label: "Manager sign-off",      done: false },
      { label: "Final documentation",   done: false },
    ],
  },
];

export default function StageGatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Stage Gates</h1>
      <div className="grid grid-cols-3 gap-4">
        {gates.map((g) => {
          const done = g.items.filter((i) => i.done).length;
          return (
            <div key={g.client} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-[#0f172a]">{g.client}</h3>
                <span className="text-xs text-[#64748b]">{done}/{g.items.length}</span>
              </div>
              <p className="text-xs text-[#64748b] mb-4">{g.stage}</p>
              <ul className="space-y-2">
                {g.items.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${item.done ? "bg-green-100 text-green-600" : "bg-[#f1f5f9] text-[#94a3b8]"}`}>
                      {item.done ? "✓" : "○"}
                    </span>
                    <span className={item.done ? "text-[#64748b] line-through" : "text-[#0f172a]"}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
