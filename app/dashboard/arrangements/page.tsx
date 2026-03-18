import { prisma } from "@/lib/prisma";
import ArrangementsTable, { type ArrangementRow } from "./ArrangementsTable";

export const dynamic = "force-dynamic";

export default async function ArrangementsPage() {
  const rows = await prisma.$queryRaw<ArrangementRow[]>`
    SELECT
      a.id,
      a.reference_number,
      a.status,
      a.start_date,
      a.fee_pence,
      a.child_name,
      a.employer_approved,
      a.employee_approved,
      a.nursery_validated,
      a.contract_addendum_required,
      a.created_at,
      emp.company_name              AS employer_name,
      nur.company_name              AS nursery_name,
      e.first_name || ' ' || e.last_name AS employee_name,
      e.email                       AS employee_email,
      EXISTS (
        SELECT 1
        FROM   agreement_acceptances aa
        JOIN   agreement_templates   at ON at.id = aa.template_id
        WHERE  aa.arrangement_id = a.id
        AND    at.type = 'SALARY_SACRIFICE_ADDENDUM'
      ) AS addendum_signed
    FROM   arrangements  a
    LEFT JOIN companies  emp ON emp.id = a.employer_id
    LEFT JOIN companies  nur ON nur.id = a.nursery_id
    LEFT JOIN employees  e   ON e.id   = a.employee_id
    ORDER BY a.created_at DESC
  `;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">All Arrangements</h1>
      <ArrangementsTable rows={rows} />
    </div>
  );
}
