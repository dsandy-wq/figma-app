export type SlaStage = { name: string; slaHours: number; trigger: string };

export const EMPLOYER_STAGES: SlaStage[] = [
  { name: "Signed Up",          slaHours: 24,  trigger: "Profile not completed" },
  { name: "Profile Complete",   slaHours: 48,  trigger: "Payroll config not set up" },
  { name: "Payroll Configured", slaHours: 12,  trigger: "Contract not sent" },
  { name: "Contract Sent",      slaHours: 72,  trigger: "Not signed" },
  { name: "Contract Signed",    slaHours: 72,  trigger: "No employees invited" },
  { name: "Employees Invited",  slaHours: 72,  trigger: "Low claim rate (<50%)" },
  { name: "Live",               slaHours: 0,   trigger: "Payment failure / arrangement issue" },
];

export const NURSERY_STAGES: SlaStage[] = [
  { name: "Signed Up",             slaHours: 24,  trigger: "Profile not completed" },
  { name: "Profile Complete",      slaHours: 12,  trigger: "Verification not initiated" },
  { name: "Verification Pending",  slaHours: 24,  trigger: "Stuck in pending review" },
  { name: "Documents Submitted",   slaHours: 24,  trigger: "Ops haven't reviewed" },
  { name: "Approved",              slaHours: 12,  trigger: "Agreement not sent" },
  { name: "Agreement Sent",        slaHours: 72,  trigger: "Not signed" },
  { name: "Live",                  slaHours: 0,   trigger: "Regulator alert fires" },
];

export const EMPLOYEE_STAGES: SlaStage[] = [
  { name: "Invited",              slaHours: 72,  trigger: "Invite not claimed" },
  { name: "Registered",           slaHours: 24,  trigger: "Profile not completed" },
  { name: "Profile Complete",     slaHours: 48,  trigger: "Employer hasn't confirmed" },
  { name: "Employer Confirmed",   slaHours: 72,  trigger: "No nursery selected" },
  { name: "Nursery Enquiry Sent", slaHours: 48,  trigger: "Nursery hasn't responded" },
  { name: "Arrangement Pending",  slaHours: 48,  trigger: "One party not approved" },
  { name: "Contracts Sent",       slaHours: 72,  trigger: "Not signed" },
  { name: "Active",               slaHours: 0,   trigger: "Payment failure / amendment" },
  { name: "Offboarding",          slaHours: 72,  trigger: "Cancellation stalled" },
];

export type SlaStatus = "ok" | "warning" | "overdue" | "none";

export function getSlaStatus(
  stage: string,
  stageEnteredAt: Date,
  stages: SlaStage[]
): SlaStatus {
  const def = stages.find((s) => s.name === stage);
  if (!def || def.slaHours === 0) return "none";
  const hoursElapsed = (Date.now() - new Date(stageEnteredAt).getTime()) / 3_600_000;
  if (hoursElapsed >= def.slaHours) return "overdue";
  if (hoursElapsed >= def.slaHours * 0.75) return "warning";
  return "ok";
}

export const SLA_DOT: Record<SlaStatus, string> = {
  overdue: "bg-red-500",
  warning: "bg-orange-400",
  ok:      "bg-green-500",
  none:    "bg-gray-300",
};
