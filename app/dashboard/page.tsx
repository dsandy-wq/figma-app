import Link from "next/link";
import { Building2, Home, Users, AlertCircle, AlertTriangle } from "lucide-react";
import StatCard from "@/app/components/StatCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const entityBadge: Record<string, string> = {
  employer: "bg-purple-100 text-purple-700",
  nursery:  "bg-teal-100 text-teal-700",
  employee: "bg-sky-100 text-sky-700",
};

function formatDue(date: Date): string {
  const d       = new Date(date);
  const now     = new Date();
  const diffHrs = (d.getTime() - now.getTime()) / 3_600_000;
  if (diffHrs < 0)  return "Overdue";
  if (diffHrs < 1)  return "< 1 hr";
  if (diffHrs < 24) return `${Math.round(diffHrs)} hrs`;
  return "Tomorrow";
}

function daysOverdueLabel(date: Date): string {
  const days = Math.ceil((new Date().getTime() - new Date(date).getTime()) / 86_400_000);
  return days === 1 ? "1 day overdue" : `${days} days overdue`;
}

export default async function DashboardPage() {
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const include = { employer: true, nursery: true, employee: true } as const;

  const [
    employersInProgress,
    nurseriesInProgress,
    employeesInProgress,
    todayInterventions,
    overdueInterventions,
    totalInterventionsDue,
  ] = await Promise.all([
    prisma.employer.count({ where: { stage: { not: "Live" } } }),
    prisma.nursery.count({  where: { stage: { not: "Live" } } }),
    prisma.employee.count({ where: { stage: { not: "Active" } } }),
    prisma.intervention.findMany({
      where: {
        status: "pending",
        dueAt:  { gte: todayStart, lte: todayEnd },
        OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
      },
      include,
      orderBy: { dueAt: "asc" },
    }),
    prisma.intervention.findMany({
      where: {
        status: "pending",
        dueAt:  { lt: todayStart },
        OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
      },
      include,
      orderBy: { dueAt: "asc" },
    }),
    prisma.intervention.count({
      where: {
        status: "pending",
        OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
      },
    }),
  ]);

  function resolveEntityName(i: typeof todayInterventions[number]) {
    if (i.employer)      return i.employer.name;
    if (i.nursery)       return i.nursery.name;
    if (i.employee)      return `${i.employee.firstName} ${i.employee.lastName}`;
    return "Unknown";
  }

  const overdueRows = overdueInterventions.map((i) => ({ ...i, entityName: resolveEntityName(i) }));
  const todayRows   = todayInterventions.map((i)   => ({ ...i, entityName: resolveEntityName(i) }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Employers Onboarding"  value={employersInProgress}   color="purple" Icon={Building2}   href="/dashboard/employers" />
        <StatCard label="Nurseries Onboarding"  value={nurseriesInProgress}   color="green"  Icon={Home}        href="/dashboard/nurseries" />
        <StatCard label="Employees In Progress" value={employeesInProgress}   color="blue"   Icon={Users}       href="/dashboard/employees" />
        <StatCard label="Interventions Due"     value={totalInterventionsDue} color="red"    Icon={AlertCircle} href="/dashboard/interventions" />
      </div>

      {/* SLA breach alert — only shown when there are overdue items */}
      {overdueRows.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-red-200 bg-red-100 px-6 py-4">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <h2 className="font-semibold text-red-800">
              SLA Breaches — {overdueRows.length} overdue intervention{overdueRows.length !== 1 ? "s" : ""}
            </h2>
            <Link href="/dashboard/interventions" className="ml-auto text-xs font-medium text-red-600 hover:underline">
              View all →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-red-200 text-left text-red-700">
                <th className="px-6 py-3 font-medium">Entity</th>
                <th className="px-6 py-3 font-medium">Action Needed</th>
                <th className="px-6 py-3 font-medium">Overdue By</th>
                <th className="px-6 py-3 font-medium">Assigned To</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {overdueRows.map((r) => (
                <tr key={r.id} className="border-b border-red-100 last:border-0 hover:bg-red-100/50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-[#0f172a]">{r.entityName}</div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${entityBadge[r.entityType] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.entityType}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[#64748b]">{r.type}</td>
                  <td className="px-6 py-3 font-semibold text-red-600 whitespace-nowrap">{daysOverdueLabel(r.dueAt)}</td>
                  <td className="px-6 py-3 text-[#64748b]">{r.assignedTo}</td>
                  <td className="px-6 py-3">
                    <Link href={`/dashboard/interventions?highlight=${r.id}`}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                      Action
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Today's intervention queue */}
        <div className="col-span-2 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-4">
            <h2 className="font-semibold text-[#0f172a]">
              Interventions Due Today
              {todayRows.length > 0 && (
                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {todayRows.length}
                </span>
              )}
            </h2>
            <Link href="/dashboard/interventions" className="text-xs font-medium text-[#3b82f6] hover:underline">
              View all →
            </Link>
          </div>

          {todayRows.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[#64748b]">No interventions due today.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
                  <th className="px-6 py-3 font-medium">Entity</th>
                  <th className="px-6 py-3 font-medium">Action Needed</th>
                  <th className="px-6 py-3 font-medium">Due</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((r) => (
                  <tr key={r.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                    <td className="px-6 py-3">
                      <div className="font-medium text-[#0f172a]">{r.entityName}</div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${entityBadge[r.entityType] ?? "bg-gray-100 text-gray-600"}`}>
                        {r.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[#64748b]">{r.type}</td>
                    <td className="px-6 py-3 text-[#64748b] whitespace-nowrap">{formatDue(r.dueAt)}</td>
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/interventions?highlight=${r.id}`}
                        className="rounded-lg bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#3b82f6] hover:bg-[#e0e7ff]">
                        Action
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Journey overview */}
        <div className="rounded-xl bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-[#0f172a]">Journey Overview</h2>

          {[
            { label: "Employers", href: "/dashboard/employers", bar: "bg-purple-500", total: employersInProgress },
            { label: "Nurseries", href: "/dashboard/nurseries", bar: "bg-teal-500",   total: nurseriesInProgress },
            { label: "Employees", href: "/dashboard/employees", bar: "bg-sky-500",    total: employeesInProgress },
          ].map((j) => (
            <Link key={j.label} href={j.href} className="block group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#64748b] group-hover:text-[#0f172a] transition-colors">{j.label}</span>
                <span className="text-sm font-semibold text-[#0f172a]">{j.total} in progress</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f1f5f9]">
                <div className={`h-2 rounded-full ${j.bar}`} style={{ width: j.total > 0 ? "100%" : "4px" }} />
              </div>
            </Link>
          ))}

          <div className="border-t border-[#f1f5f9] pt-4 space-y-2">
            {overdueRows.length > 0 && (
              <Link href="/dashboard/interventions"
                className="flex items-center justify-between rounded-lg bg-red-600 px-4 py-3 hover:bg-red-700 transition-colors">
                <span className="text-sm font-medium text-white">SLA breaches</span>
                <span className="text-lg font-bold text-white">{overdueRows.length}</span>
              </Link>
            )}
            <Link href="/dashboard/interventions"
              className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 hover:bg-red-100 transition-colors">
              <span className="text-sm font-medium text-red-700">All pending interventions</span>
              <span className="text-lg font-bold text-red-700">{totalInterventionsDue}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
