import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// Vercel decommissioned (HAL-1688). NEXTAUTH_URL is set in the deployed
// env; the localhost fallback only applies to local dev.
const SITE_URL    = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = "craig@dbhalo.com";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

  const hashed        = await bcrypt.hash(password, 12);
  const approvalToken = randomBytes(32).toString("hex");

  await prisma.user.create({
    data: { email, name: name ?? null, password: hashed, approved: false, approvalToken },
  });

  // Resend email transport removed (HAL-1687 dead-vendor cleanup). The
  // approval token is persisted above; an admin approves via the approve URL.
  const approveUrl = `${SITE_URL}/api/approve?token=${approvalToken}`;
  console.info(`[register] account request for ${email} — approve at: ${approveUrl}`);
  void ADMIN_EMAIL;

  return NextResponse.json({ pending: true }, { status: 201 });
}
