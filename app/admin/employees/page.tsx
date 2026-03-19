import { prisma } from "@/lib/prisma";
import EmployeesTable from "./EmployeesTable";

export const dynamic = "force-dynamic";

type EmployeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  employerName: string | null;
  stage: string;
  status: string;
  stageEnteredAt: Date;
};

export default async function EmployeesPage() {
  const employees = await prisma.$queryRaw<EmployeeRow[]>`
    SELECT
      id,
      first_name    AS "firstName",
      last_name     AS "lastName",
      email,
      employer_name AS "employerName",
      CASE status
        WHEN 'APPROVED' THEN 'Active'
        WHEN 'INVITED'  THEN 'Invited'
        WHEN 'CLAIMED'  THEN 'Profile Complete'
        WHEN 'LINKED'   THEN 'Active'
        ELSE 'Signed Up'
      END AS stage,
      CASE status
        WHEN 'REJECTED' THEN 'At Risk'
        WHEN 'INACTIVE' THEN 'At Risk'
        ELSE 'On Track'
      END AS status,
      created_at AS "stageEnteredAt"
    FROM employees
    ORDER BY created_at DESC
  `;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Employees</h1>
      <EmployeesTable employees={employees} />
    </div>
  );
}
