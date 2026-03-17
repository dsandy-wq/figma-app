import { prisma } from "@/lib/prisma";
import EmployersTable from "./EmployersTable";

export const dynamic = "force-dynamic";

type EmployerRow = {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  stage: string;
  status: string;
  stageEnteredAt: Date;
};

export default async function EmployersPage() {
  const employers = await prisma.$queryRaw<EmployerRow[]>`
    SELECT
      id,
      company_name      AS name,
      contact_name      AS "contactName",
      contact_email     AS "contactEmail",
      COALESCE(onboarding_status, 'Signed Up') AS stage,
      'On Track'        AS status,
      created_at        AS "stageEnteredAt"
    FROM companies
    WHERE is_nursery = false
    ORDER BY created_at DESC
  `;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Employers</h1>
      <EmployersTable employers={employers} />
    </div>
  );
}
