import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, contactName, contactEmail, companyNumber, stage } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const employer = await prisma.employer.create({
      data: {
        name:          name.trim(),
        contactName:   contactName?.trim()   || null,
        contactEmail:  contactEmail?.trim()  || null,
        companyNumber: companyNumber?.trim() || null,
        stage:         stage ?? "Signed Up",
        status:        "On Track",
      },
    });

    return NextResponse.json(employer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create employer." }, { status: 500 });
  }
}
