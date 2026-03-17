type InterventionItem = {
  entityName:  string;
  entityType:  string;
  type:        string;
  assignedTo:  string;
  dueAt:       Date;
  daysOverdue?: number;
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function entityColor(type: string): string {
  if (type === "employer") return "#7c3aed";
  if (type === "nursery")  return "#0d9488";
  return "#0284c7";
}

function row(item: InterventionItem): string {
  const color = entityColor(item.entityType);
  return `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px 16px;">
        <strong style="color:#0f172a;">${item.entityName}</strong><br/>
        <span style="background:${color}20;color:${color};font-size:11px;padding:1px 8px;border-radius:99px;">${item.entityType}</span>
      </td>
      <td style="padding:12px 16px;color:#475569;">${item.type}</td>
      <td style="padding:12px 16px;color:#475569;">${formatTime(item.dueAt)}</td>
      <td style="padding:12px 16px;color:#475569;">${item.assignedTo}</td>
    </tr>`;
}

function breachRow(item: InterventionItem): string {
  const color = entityColor(item.entityType);
  const age   = item.daysOverdue === 1 ? "1 day" : `${item.daysOverdue} days`;
  return `
    <tr style="border-bottom:1px solid #fee2e2;">
      <td style="padding:12px 16px;">
        <strong style="color:#0f172a;">${item.entityName}</strong><br/>
        <span style="background:${color}20;color:${color};font-size:11px;padding:1px 8px;border-radius:99px;">${item.entityType}</span>
      </td>
      <td style="padding:12px 16px;color:#475569;">${item.type}</td>
      <td style="padding:12px 16px;color:#dc2626;font-weight:600;">${age} overdue</td>
      <td style="padding:12px 16px;color:#475569;">${item.assignedTo}</td>
    </tr>`;
}

export function overviewEmail(
  interventions: InterventionItem[],
  slaBreaches:   InterventionItem[],
  date:          string
): string {
  const grouped = new Map<string, InterventionItem[]>();
  for (const i of interventions) {
    if (!grouped.has(i.assignedTo)) grouped.set(i.assignedTo, []);
    grouped.get(i.assignedTo)!.push(i);
  }

  const sections = [...grouped.entries()].map(([person, items]) => `
    <h3 style="margin:24px 0 8px;color:#0f172a;">${person} — ${items.length} task${items.length !== 1 ? "s" : ""}</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
      <thead>
        <tr style="background:#f8fafc;color:#64748b;font-size:12px;">
          <th style="padding:10px 16px;text-align:left;">Entity</th>
          <th style="padding:10px 16px;text-align:left;">Action</th>
          <th style="padding:10px 16px;text-align:left;">Due</th>
          <th style="padding:10px 16px;text-align:left;">Assigned</th>
        </tr>
      </thead>
      <tbody>${items.map(row).join("")}</tbody>
    </table>`).join("");

  const breachSection = slaBreaches.length === 0 ? "" : `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px 24px;margin-bottom:32px;">
      <h2 style="margin:0 0 4px;font-size:17px;color:#991b1b;">&#9888; SLA Breaches — ${slaBreaches.length} overdue intervention${slaBreaches.length !== 1 ? "s" : ""}</h2>
      <p style="margin:0 0 16px;font-size:13px;color:#b91c1c;">These interventions were not actioned by their due date and require immediate attention.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #fecaca;">
        <thead>
          <tr style="background:#fef2f2;color:#991b1b;font-size:12px;">
            <th style="padding:10px 16px;text-align:left;">Entity</th>
            <th style="padding:10px 16px;text-align:left;">Action</th>
            <th style="padding:10px 16px;text-align:left;">Overdue By</th>
            <th style="padding:10px 16px;text-align:left;">Assigned</th>
          </tr>
        </thead>
        <tbody>${slaBreaches.map(breachRow).join("")}</tbody>
      </table>
    </div>`;

  return `
    <div style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:32px 16px;color:#0f172a;">
      <div style="background:#0f1629;border-radius:12px;padding:24px 32px;margin-bottom:32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Halo Ops — Daily Overview</h1>
        <p style="color:#94a3b8;margin:6px 0 0;">${date}</p>
      </div>
      ${breachSection}
      <p style="color:#475569;">Good morning Craig. Here's a summary of all <strong>${interventions.length} intervention${interventions.length !== 1 ? "s" : ""}</strong> due today across the team.</p>
      ${sections}
      <p style="margin-top:32px;font-size:13px;color:#94a3b8;">View the full dashboard at <a href="${process.env.NEXTAUTH_URL}/dashboard/interventions" style="color:#3b82f6;">Halo Ops Dashboard</a></p>
    </div>`;
}

export function staffEmail(person: string, interventions: InterventionItem[], date: string): string {
  return `
    <div style="font-family:sans-serif;max-width:650px;margin:0 auto;padding:32px 16px;color:#0f172a;">
      <div style="background:#0f1629;border-radius:12px;padding:24px 32px;margin-bottom:32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your tasks for today</h1>
        <p style="color:#94a3b8;margin:6px 0 0;">${date}</p>
      </div>
      <p style="color:#475569;">Hi ${person.split(" ")[0]}, you have <strong>${interventions.length} intervention${interventions.length !== 1 ? "s" : ""}</strong> due today.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f8fafc;color:#64748b;font-size:12px;">
            <th style="padding:10px 16px;text-align:left;">Entity</th>
            <th style="padding:10px 16px;text-align:left;">Action</th>
            <th style="padding:10px 16px;text-align:left;">Due</th>
          </tr>
        </thead>
        <tbody>${interventions.map((i) => `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:12px 16px;">
              <strong style="color:#0f172a;">${i.entityName}</strong><br/>
              <span style="background:${entityColor(i.entityType)}20;color:${entityColor(i.entityType)};font-size:11px;padding:1px 8px;border-radius:99px;">${i.entityType}</span>
            </td>
            <td style="padding:12px 16px;color:#475569;">${i.type}</td>
            <td style="padding:12px 16px;color:#475569;">${formatTime(i.dueAt)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <p style="margin-top:32px;font-size:13px;color:#94a3b8;">View your queue at <a href="${process.env.NEXTAUTH_URL}/dashboard/interventions" style="color:#3b82f6;">Halo Ops Dashboard</a></p>
    </div>`;
}
