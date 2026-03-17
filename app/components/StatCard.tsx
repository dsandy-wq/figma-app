import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const colorMap = {
  blue:   { border: "border-[#3b82f6]", icon: "bg-blue-100 text-blue-600" },
  green:  { border: "border-[#10b981]", icon: "bg-green-100 text-green-600" },
  orange: { border: "border-[#f59e0b]", icon: "bg-orange-100 text-orange-600" },
  red:    { border: "border-[#ef4444]", icon: "bg-red-100 text-red-600" },
  purple: { border: "border-[#7c3aed]", icon: "bg-purple-100 text-purple-600" },
};

type Color = keyof typeof colorMap;

export default function StatCard({
  label, value, color, Icon, href,
}: {
  label: string;
  value: string | number;
  color: Color;
  Icon?: LucideIcon;
  href?: string;
}) {
  const c = colorMap[color];
  const inner = (
    <div className={`flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border-l-4 ${c.border} ${href ? "hover:bg-[#f8fafc] transition-colors" : ""}`}>
      <div>
        <p className="text-sm text-[#64748b]">{label}</p>
        <p className="mt-1 text-3xl font-bold text-[#0f172a]">{value}</p>
      </div>
      {Icon && (
        <div className={`rounded-full p-3 ${c.icon}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
