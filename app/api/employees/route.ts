import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, employerName, stage } = await req.json();
    if (!firstName?.trim() || !lastName?.trim())
      return NextResponse.json({ error: "First and last name are required." }, { status: 400 });

    const employee = await prisma.employee.create({
      data: {
        firstName:    firstName.trim(),
        lastName:     lastName.trim(),
        email:        email?.trim()        || null,
        employerName: employerName?.trim() || null,
        stage:        stage ?? "Invited",
        status:       "On Track",
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create employee." }, { status: 500 });
  }
}
