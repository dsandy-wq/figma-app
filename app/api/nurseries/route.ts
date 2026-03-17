import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, contactName, contactEmail, ofstedNumber, stage } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const nursery = await prisma.nursery.create({
      data: {
        name:         name.trim(),
        contactName:  contactName?.trim()  || null,
        contactEmail: contactEmail?.trim() || null,
        ofstedNumber: ofstedNumber?.trim() || null,
        stage:        stage ?? "Signed Up",
        status:       "On Track",
      },
    });

    return NextResponse.json(nursery, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create nursery." }, { status: 500 });
  }
}
