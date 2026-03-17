import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86_400_000);

  const assignedTo = req.nextUrl.searchParams.get("assignedTo") ?? undefined;
  const assignedFilter = assignedTo ? { assignedTo } : {};

  const [today, overdue] = await Promise.all([
    prisma.intervention.findMany({
      where: {
        status: "pending",
        dueAt: { gte: todayStart, lt: todayEnd },
        OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
        ...assignedFilter,
      },
      orderBy: { dueAt: "asc" },
    }),
    prisma.intervention.findMany({
      where: {
        status: "pending",
        dueAt: { lt: todayStart },
        OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
        ...assignedFilter,
      },
      orderBy: { dueAt: "asc" },
    }),
  ]);

  function toRow(i: typeof today[0], isOverdue: boolean) {
    return { id: i.id, entityName: i.entityName, entityType: i.entityType, type: i.type, assignedTo: i.assignedTo, dueAt: i.dueAt, isOverdue };
  }

  return NextResponse.json({
    overdue: overdue.map((i) => toRow(i, true)),
    today:   today.map((i)   => toRow(i, false)),
  });
}
