import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Vercel decommissioned (HAL-1688). NEXTAUTH_URL is set in the deployed
  // env; the localhost fallback only applies to local dev (no live Vercel
  // host to redirect to).
  const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

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
