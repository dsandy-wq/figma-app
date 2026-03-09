import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const SITE_URL = process.env.NEXTAUTH_URL ?? "https://figma-app-black.vercel.app";

  if (!token)
    return NextResponse.redirect(`${SITE_URL}/signin?error=invalid-token`);

  const user = await prisma.user.findUnique({ where: { approvalToken: token } });

  if (!user)
    return NextResponse.redirect(`${SITE_URL}/signin?error=invalid-token`);

  await prisma.user.update({
    where: { id: user.id },
    data:  { approved: true, approvalToken: null },
  });

  return NextResponse.redirect(`${SITE_URL}/signin?approved=1`);
}
