import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const now = new Date();
const daysAgo = (n) => new Date(now - n * 24 * 60 * 60 * 1000);
const hrs     = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);

async function main() {
  // ── Auth: admin user ─────────────────────────────────────────────────────
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where:  { email: "admin@halo.dev" },
    update: {},
    create: { email: "admin@halo.dev", name: "Admin", password: hash, approved: true },
  });

  const craigHash = await bcrypt.hash("Halo@1234", 10);
  await prisma.user.upsert({
    where:  { email: "craig@dbhalo.com" },
    update: {},
    create: { email: "craig@dbhalo.com", name: "Craig", password: craigHash, approved: true },
  });

  // ── Clear domain data ────────────────────────────────────────────────────
  await prisma.intervention.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.nursery.deleteMany();
  await prisma.employee.deleteMany();

  // ── Employers ────────────────────────────────────────────────────────────
  const emp1 = await prisma.employer.create({ data: {
    name: "TechNova Ltd",     contactName: "James Riley",  contactEmail: "james@technova.co.uk",
    companyNumber: "12345678", stage: "Live",               status: "On Track", stageEnteredAt: daysAgo(10),
  }});
  const emp2 = await prisma.employer.create({ data: {
    name: "Meridian Finance", contactName: "Sarah Okafor", contactEmail: "sarah@meridian.co.uk",
    companyNumber: "23456789", stage: "Contract Sent",      status: "On Track", stageEnteredAt: daysAgo(4),
  }});
  const emp3 = await prisma.employer.create({ data: {
    name: "Crestfield Group", contactName: "Tom Hughes",   contactEmail: "tom@crestfield.co.uk",
    companyNumber: "34567890", stage: "Employees Invited",  status: "At Risk",  stageEnteredAt: daysAgo(5),
  }});
  const emp4 = await prisma.employer.create({ data: {
    name: "Apex Consulting",  contactName: "Priya Shah",   contactEmail: "priya@apex.co.uk",
    companyNumber: "45678901", stage: "Profile Complete",   status: "On Track", stageEnteredAt: daysAgo(3),
  }});
  const emp5 = await prisma.employer.create({ data: {
    name: "Bluewater Retail", contactName: "Dan Marsh",    contactEmail: "dan@bluewater.co.uk",
    companyNumber: "56789012", stage: "Signed Up",          status: "Pending",  stageEnteredAt: daysAgo(1),
  }});

  // ── Nurseries ────────────────────────────────────────────────────────────
  const nur1 = await prisma.nursery.create({ data: {
    name: "Bright Stars Nursery",   contactName: "Helen Ward",  contactEmail: "helen@brightstars.co.uk",
    ofstedNumber: "EY123456", stage: "Live",                 status: "On Track", stageEnteredAt: daysAgo(30),
  }});
  const nur2 = await prisma.nursery.create({ data: {
    name: "Little Acorns Day Care", contactName: "Mark Ellis",  contactEmail: "mark@littleacorns.co.uk",
    ofstedNumber: "EY234567", stage: "Documents Submitted",  status: "On Track", stageEnteredAt: daysAgo(2),
  }});
  const nur3 = await prisma.nursery.create({ data: {
    name: "Sunflower Childcare",    contactName: "Aisha Patel", contactEmail: "aisha@sunflower.co.uk",
    ofstedNumber: "EY345678", stage: "Verification Pending", status: "On Track", stageEnteredAt: daysAgo(3),
  }});
  const nur4 = await prisma.nursery.create({ data: {
    name: "Rainbow Kids",           contactName: "Carl Nolan",  contactEmail: "carl@rainbowkids.co.uk",
    ofstedNumber: "EY456789", stage: "Agreement Sent",       status: "At Risk",  stageEnteredAt: daysAgo(4),
  }});
  const nur5 = await prisma.nursery.create({ data: {
    name: "Tiny Explorers",         contactName: "Lucy Dewar",  contactEmail: "lucy@tinyexplorers.co.uk",
    ofstedNumber: "EY567890", stage: "Signed Up",            status: "Pending",  stageEnteredAt: daysAgo(1),
  }});

  // ── Employees ────────────────────────────────────────────────────────────
  const empl1 = await prisma.employee.create({ data: {
    firstName: "Oliver", lastName: "Bennett", email: "oliver@technova.co.uk",
    employerName: "TechNova Ltd",     stage: "Active",              status: "On Track", stageEnteredAt: daysAgo(14),
  }});
  const empl2 = await prisma.employee.create({ data: {
    firstName: "Chloe",  lastName: "Foster",  email: "chloe@meridian.co.uk",
    employerName: "Meridian Finance", stage: "Arrangement Pending", status: "On Track", stageEnteredAt: daysAgo(6),
  }});
  const empl3 = await prisma.employee.create({ data: {
    firstName: "Ryan",   lastName: "Carr",    email: "ryan@crestfield.co.uk",
    employerName: "Crestfield Group", stage: "Profile Complete",    status: "On Track", stageEnteredAt: daysAgo(4),
  }});
  const empl4 = await prisma.employee.create({ data: {
    firstName: "Emma",   lastName: "Price",   email: "emma@apex.co.uk",
    employerName: "Apex Consulting",  stage: "Invited",             status: "Pending",  stageEnteredAt: daysAgo(5),
  }});
  const empl5 = await prisma.employee.create({ data: {
    firstName: "Noah",   lastName: "Simmons", email: "noah@bluewater.co.uk",
    employerName: "Bluewater Retail", stage: "Contracts Sent",      status: "On Track", stageEnteredAt: daysAgo(4),
  }});

  // ── Interventions ────────────────────────────────────────────────────────
  await prisma.intervention.createMany({ data: [
    // Due today
    { entityType: "employer",  employerId: emp2.id,   type: "Chase contract signature",  assignedTo: "Sarah M.", dueAt: hrs(4),  status: "pending" },
    { entityType: "employer",  employerId: emp3.id,   type: "Low invite claim rate",      assignedTo: "James T.", dueAt: hrs(2),  status: "pending" },
    { entityType: "employer",  employerId: emp4.id,   type: "Payroll config follow-up",   assignedTo: "Lee R.",   dueAt: hrs(6),  status: "pending" },
    { entityType: "nursery",   nurseryId:  nur3.id,   type: "Verification check overdue", assignedTo: "Sarah M.", dueAt: hrs(3),  status: "pending" },
    { entityType: "nursery",   nurseryId:  nur4.id,   type: "Chase agreement signature",  assignedTo: "James T.", dueAt: hrs(8),  status: "pending" },
    { entityType: "employee",  employeeId: empl4.id,  type: "Invite not claimed — chase", assignedTo: "Sarah M.", dueAt: hrs(1),  status: "pending" },
    { entityType: "employee",  employeeId: empl2.id,  type: "Arrangement approval chase", assignedTo: "James T.", dueAt: hrs(5),  status: "pending" },

    // SLA breaches — past due, still pending
    { entityType: "employer",  employerId: emp2.id,   type: "Contract not returned",      assignedTo: "Sarah M.", dueAt: daysAgo(3), status: "pending" },
    { entityType: "nursery",   nurseryId:  nur2.id,   type: "Review submitted documents", assignedTo: "Lee R.",   dueAt: daysAgo(1), status: "pending" },
    { entityType: "nursery",   nurseryId:  nur5.id,   type: "Profile completion chase",   assignedTo: "James T.", dueAt: daysAgo(2), status: "pending" },
    { entityType: "employee",  employeeId: empl5.id,  type: "Contracts not signed",       assignedTo: "Lee R.",   dueAt: daysAgo(4), status: "pending" },
    { entityType: "employee",  employeeId: empl3.id,  type: "Employer confirmation chase", assignedTo: "Sarah M.", dueAt: daysAgo(1), status: "pending" },
  ]});

  console.log("Seeded: 5 employers, 5 nurseries, 5 employees, 12 interventions (5 SLA breaches).");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
