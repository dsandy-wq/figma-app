import { prisma } from "@/lib/prisma";
import { TEAM_MEMBERS } from "@/lib/team";
import InterventionsTable from "./InterventionsTable";

export const dynamic = "force-dynamic";

export default async function InterventionsPage({
  searchParams,
}: {
  searchParams: Promise<{ highlight?: string }>;
}) {
  const { highlight } = await searchParams;
  const now = new Date();

  const users = await prisma.user.findMany({
    where: { approved: true },
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const userNames = users.map((u) => u.name).filter(Boolean) as string[];
  const allMembers = Array.from(new Set([...TEAM_MEMBERS, ...userNames])).sort();

  const interventions = await prisma.intervention.findMany({
    where: {
      status: "pending",
      OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
    },
    orderBy: { dueAt: "asc" },
  });

  const rows = interventions.map((i) => ({
    id:         i.id,
    entityId:   i.employerId ?? i.nurseryId ?? i.employeeId ?? "",
    entityName: i.entityName,
    entityType: i.entityType,
    type:       i.type,
    assignedTo: i.assignedTo,
    dueAt:      i.dueAt,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Interventions Due</h1>
      <InterventionsTable interventions={rows} teamMembers={allMembers} highlightId={highlight} />
    </div>
  );
}
