import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { TEAM } from "@/lib/team";
import { overviewEmail, staffEmail } from "@/lib/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const results: string[] = [];

  // Overview email to Craig (includes SLA breaches section)
  const overviewResult = await resend.emails.send({
    from:    "Halo Ops <noreply@dbhalo.com>",
    to:      "craig@dbhalo.com",
    subject: slaBreaches.length > 0
      ? `Halo Ops — Daily Overview ⚠ ${slaBreaches.length} SLA breach${slaBreaches.length !== 1 ? "es" : ""} (${now.toLocaleDateString("en-GB")})`
      : `Halo Ops — Daily Overview (${now.toLocaleDateString("en-GB")})`,
    html: overviewEmail(items, slaBreaches, dateLabel),
  });
  results.push(`overview → craig@dbhalo.com (${overviewResult.error ? "FAILED: " + overviewResult.error.message : "ok"})`);

  // Individual emails to each team member (today's tasks only)
  for (const member of TEAM) {
    const myItems = items.filter((i) => i.assignedTo === member.name);
    if (myItems.length === 0) continue;

    const staffResult = await resend.emails.send({
      from:    "Halo Ops <noreply@dbhalo.com>",
      to:      member.email,
      subject: `Your Halo tasks for ${now.toLocaleDateString("en-GB")} (${myItems.length})`,
      html:    staffEmail(member.name, myItems, dateLabel),
    });
    results.push(`${member.name} → ${member.email} (${staffResult.error ? "FAILED: " + staffResult.error.message : "ok"})`);
  }

  return NextResponse.json({ ok: true, sent: results.length, slaBreaches: slaBreaches.length, results });
}
