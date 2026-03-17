import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entityId   = searchParams.get("entityId");
  const entityType = searchParams.get("entityType");

  if (!entityId || !entityType)
    return NextResponse.json({ error: "entityId and entityType required" }, { status: 400 });

  const where =
    entityType === "employer" ? { employerId: entityId } :
    entityType === "nursery"  ? { nurseryId:  entityId } :
                                { employeeId: entityId };

  const notes = await prisma.note.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entityId, entityType, content } = await req.json() as {
    entityId:   string;
    entityType: string;
    content:    string;
  };

  if (!entityId || !entityType || !content?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const authorName = session.user?.name ?? "Admin";

  const data =
    entityType === "employer"
      ? { entityType, content: content.trim(), authorName, employerId: entityId }
      : entityType === "nursery"
      ? { entityType, content: content.trim(), authorName, nurseryId:  entityId }
      : { entityType, content: content.trim(), authorName, employeeId: entityId };

  const note = await prisma.note.create({ data });

  return NextResponse.json(note, { status: 201 });
}
