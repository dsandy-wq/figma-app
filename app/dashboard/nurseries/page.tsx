import { prisma } from "@/lib/prisma";
import NurseriesTable from "./NurseriesTable";

export const dynamic = "force-dynamic";

type RawRow = {
  id:                  string;
  name:                string;
  contactName:         string | null;
  contactEmail:        string | null;
  ofstedNumber:        string | null;
  careInspectorate:    string | null;
  verificationStatus:  string | null;
  onboardingStatus:    string | null;
  createdAt:           Date;
  docCount:            number;
  agreementCount:      number;
  agreementSignedAt:   Date | null;
  activeArrangements:  number;
  firstActiveAt:       Date | null;
};

function deriveStage(row: RawRow): { stage: string; stageEnteredAt: Date } {
  const fallback = new Date(row.createdAt);

  if (row.onboardingStatus === "COMPLETED" || row.activeArrangements > 0) {
    return { stage: "Live", stageEnteredAt: row.firstActiveAt ?? fallback };
  }
  if (row.agreementCount > 0) {
    return { stage: "Agreement Sent", stageEnteredAt: row.agreementSignedAt ?? fallback };
  }
  if (row.verificationStatus === "VERIFIED") {
    return { stage: "Approved", stageEnteredAt: fallback };
  }
  if (row.docCount > 0) {
    return { stage: "Documents Submitted", stageEnteredAt: fallback };
  }
  if (row.verificationStatus === "PENDING") {
    return { stage: "Verification Pending", stageEnteredAt: fallback };
  }
  if (row.contactName && (row.ofstedNumber || row.careInspectorate)) {
    return { stage: "Profile Complete", stageEnteredAt: fallback };
  }
  return { stage: "Signed Up", stageEnteredAt: fallback };
}

export default async function NurseriesPage() {
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      c.id,
      c.company_name        AS name,
      c.contact_name        AS "contactName",
      c.contact_email       AS "contactEmail",
      c.ofsted_number       AS "ofstedNumber",
      c.care_inspectorate   AS "careInspectorate",
      c.verification_status AS "verificationStatus",
      c.onboarding_status   AS "onboardingStatus",
      c.created_at          AS "createdAt",

      (SELECT COUNT(*)::int
         FROM nursery_documents nd
        WHERE nd.nursery_id = c.id)                                   AS "docCount",

      (SELECT COUNT(*)::int
         FROM agreement_acceptances aa
         JOIN agreement_templates   at ON at.id = aa.template_id
        WHERE aa.company_id = c.id
          AND at.type IN ('NURSERY_PARTNERSHIP', 'EMPLOYER_NURSERY_PARTNERSHIP'))
                                                                       AS "agreementCount",

      (SELECT MIN(aa.accepted_at)
         FROM agreement_acceptances aa
         JOIN agreement_templates   at ON at.id = aa.template_id
        WHERE aa.company_id = c.id
          AND at.type IN ('NURSERY_PARTNERSHIP', 'EMPLOYER_NURSERY_PARTNERSHIP'))
                                                                       AS "agreementSignedAt",

      (SELECT COUNT(*)::int
         FROM arrangements a
        WHERE a.nursery_id = c.id AND a.status = 'ACTIVE')            AS "activeArrangements",

      (SELECT MIN(a.created_at)
         FROM arrangements a
        WHERE a.nursery_id = c.id AND a.status = 'ACTIVE')            AS "firstActiveAt"

    FROM companies c
    WHERE c.is_nursery = true
    ORDER BY c.created_at DESC
  `;

  const nurseries = rows.map((r) => {
    const { stage, stageEnteredAt } = deriveStage(r);
    return {
      id:             r.id,
      name:           r.name,
      contactName:    r.contactName,
      contactEmail:   r.contactEmail,
      ofstedNumber:   r.ofstedNumber,
      stage,
      status:         stage === "Live" ? "Complete" : "On Track",
      stageEnteredAt,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Nurseries</h1>
      <NurseriesTable nurseries={nurseries} />
    </div>
  );
}
