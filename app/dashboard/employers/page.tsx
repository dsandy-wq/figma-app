import { prisma } from "@/lib/prisma";
import EmployersTable from "./EmployersTable";

export const dynamic = "force-dynamic";

type RawRow = {
  id:                  string;
  name:                string;
  contactName:         string | null;
  contactEmail:        string | null;
  createdAt:           Date;
  payrollCount:        number;
  employeeCount:       number;
  adminAgreementCount: number;
  activeArrangements:  number;
  firstActiveAt:       Date | null;
  mandateId:           string | null;
};

function deriveStage(row: RawRow): { stage: string; stageEnteredAt: Date } {
  const fallback = new Date(row.createdAt);

  if (row.activeArrangements > 0) {
    return { stage: "Live", stageEnteredAt: row.firstActiveAt ?? fallback };
  }
  if (row.employeeCount > 0) {
    return { stage: "Employees Invited", stageEnteredAt: fallback };
  }
  if (row.adminAgreementCount > 0) {
    return { stage: "Contract Signed", stageEnteredAt: fallback };
  }
  if (row.payrollCount > 0) {
    return { stage: "Payroll Configured", stageEnteredAt: fallback };
  }
  if (row.contactName) {
    return { stage: "Profile Complete", stageEnteredAt: fallback };
  }
  return { stage: "Signed Up", stageEnteredAt: fallback };
}

export default async function EmployersPage() {
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      c.id,
      c.company_name    AS name,
      c.contact_name    AS "contactName",
      c.contact_email   AS "contactEmail",
      c.created_at      AS "createdAt",

      (SELECT COUNT(*)::int
         FROM payroll_configs pc
        WHERE pc.company_id = c.id)                                    AS "payrollCount",

      (SELECT COUNT(*)::int
         FROM employees e
        WHERE e.company_id = c.id)                                     AS "employeeCount",

      (SELECT COUNT(*)::int
         FROM agreement_acceptances aa
         JOIN agreement_templates   at ON at.id = aa.template_id
        WHERE aa.company_id = c.id
          AND at.type = 'EMPLOYER_BENEFITS_ADMINISTRATION')            AS "adminAgreementCount",

      (SELECT COUNT(*)::int
         FROM arrangements a
        WHERE a.employer_id = c.id AND a.status = 'ACTIVE')           AS "activeArrangements",

      (SELECT MIN(a.created_at)
         FROM arrangements a
        WHERE a.employer_id = c.id AND a.status = 'ACTIVE')           AS "firstActiveAt",

      c.gocardless_mandate_id                                          AS "mandateId"

    FROM companies c
    WHERE c.is_nursery = false
    ORDER BY c.created_at DESC
  `;

  const employers = rows.map((r) => {
    const { stage, stageEnteredAt } = deriveStage(r);
    return {
      id:            r.id,
      name:          r.name,
      contactName:   r.contactName,
      contactEmail:  r.contactEmail,
      stage,
      status:        stage === "Live" ? "Complete" : "On Track",
      stageEnteredAt,
      hasMandate:    !!r.mandateId,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Employers</h1>
      <EmployersTable employers={employers} />
    </div>
  );
}
