import { prisma } from "@/lib/prisma";
import NurseriesTable from "./NurseriesTable";

export const dynamic = "force-dynamic";

type NurseryRow = {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  ofstedNumber: string | null;
  stage: string;
  status: string;
  stageEnteredAt: Date;
};

export default async function NurseriesPage() {
  const nurseries = await prisma.$queryRaw<NurseryRow[]>`
    SELECT
      id,
      company_name      AS name,
      contact_name      AS "contactName",
      contact_email     AS "contactEmail",
      ofsted_number     AS "ofstedNumber",
      COALESCE(onboarding_status, 'Signed Up') AS stage,
      'On Track'        AS status,
      created_at        AS "stageEnteredAt"
    FROM companies
    WHERE is_nursery = true
    ORDER BY created_at DESC
  `;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Nurseries</h1>
      <NurseriesTable nurseries={nurseries} />
    </div>
  );
}
