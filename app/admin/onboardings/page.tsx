const onboardings = [
  { client: "Acme Corp",        stage: "Documentation",      days: 12, pct: 45 },
  { client: "Bright Solutions", stage: "Active Onboarding",  days: 7,  pct: 68 },
  { client: "Crestwood Ltd",    stage: "Review & Approval",  days: 3,  pct: 85 },
  { client: "Delta Partners",   stage: "Initial Assessment", days: 21, pct: 15 },
  { client: "Echo Industries",  stage: "Documentation",      days: 14, pct: 40 },
  { client: "Falcon Ltd",       stage: "Active Onboarding",  days: 9,  pct: 60 },
];

const stageColor: Record<string, string> = {
  "Initial Assessment": "bg-orange-100 text-orange-700",
  "Documentation":      "bg-blue-100 text-blue-700",
  "Active Onboarding":  "bg-purple-100 text-purple-700",
  "Review & Approval":  "bg-green-100 text-green-700",
};

export default function OnboardingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Active Onboardings</h1>
      <div className="grid grid-cols-3 gap-4">
        {onboardings.map((o) => (
          <div key={o.client} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-[#0f172a]">{o.client}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stageColor[o.stage] ?? "bg-gray-100 text-gray-600"}`}>{o.stage}</span>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-[#64748b]">
                <span>Progress</span><span>{o.pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f1f5f9]">
                <div className="h-2 rounded-full bg-[#3b82f6]" style={{ width: `${o.pct}%` }} />
              </div>
            </div>
            <p className="mt-3 text-xs text-[#64748b]">{o.days} days remaining</p>
          </div>
        ))}
      </div>
    </div>
  );
}
