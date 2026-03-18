import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 30);

  const interventions = await prisma.intervention.findMany({
    where: {
      status: "pending",
      OR: [
        { deferredUntil: null, dueAt: { gte: from, lte: to } },
        { deferredUntil: { gte: from, lte: to } },
      ],
    },
    orderBy: { dueAt: "asc" },
  });

  const events = interventions.map((i) => ({
    id:          i.id,
    type:        i.type,
    assignedTo:  i.assignedTo,
    entityName:  i.entityName,
    entityType:  i.entityType,
    isDeferred:  !!i.deferredUntil,
    date:        (i.deferredUntil ?? i.dueAt).toISOString(),
    originalDue: i.dueAt.toISOString(),
  }));

  return NextResponse.json(events);
}
