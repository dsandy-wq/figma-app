import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TEAM } from "@/lib/team";
import { overviewEmail, staffEmail } from "@/lib/emailTemplates";

function mapIntervention(i: {
  entityName: string;
  entityType: string;
  type:       string;
  assignedTo: string;
  dueAt:      Date;
}, daysOverdue?: number) {
  return { entityName: i.entityName, entityType: i.entityType, type: i.type, assignedTo: i.assignedTo, dueAt: i.dueAt, daysOverdue };
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const [todayRaw, overdueRaw] = await Promise.all([
    prisma.intervention.findMany({
      where: {
        status: "pending",
        dueAt:  { gte: todayStart, lte: todayEnd },
        OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
      },
      orderBy: { dueAt: "asc" },
    }),
    prisma.intervention.findMany({
      where: {
        status: "pending",
        dueAt:  { lt: todayStart },
        OR: [{ deferredUntil: null }, { deferredUntil: { lte: now } }],
      },
      orderBy: { dueAt: "asc" },
    }),
  ]);

  const items      = todayRaw.map((i) => mapIntervention(i));
  const slaBreaches = overdueRaw.map((i) => {
    const daysOverdue = Math.ceil((todayStart.getTime() - new Date(i.dueAt).getTime()) / 86_400_000);
    return mapIntervention(i, daysOverdue);
  });

  if (items.length === 0 && slaBreaches.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "Nothing due or overdue today." });
  }

  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Resend email transport removed (HAL-1687 dead-vendor cleanup). The digest
  // is still computed and rendered; it is returned in the response rather than
  // emailed. Re-wire a transport here if this route is ever revived.
  const overviewHtml = overviewEmail(items, slaBreaches, dateLabel);
  const staffDigests = TEAM.map((member) => ({
    name:  member.name,
    email: member.email,
    items: items.filter((i) => i.assignedTo === member.name),
  }))
    .filter((d) => d.items.length > 0)
    .map((d) => ({ name: d.name, email: d.email, html: staffEmail(d.name, d.items, dateLabel) }));

  return NextResponse.json({
    ok: true,
    sent: 0,
    slaBreaches: slaBreaches.length,
    overviewHtml,
    staffDigests,
  });
}
