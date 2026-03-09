import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL    = process.env.NEXTAUTH_URL ?? "https://figma-app-black.vercel.app";
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

  const approveUrl = `${SITE_URL}/api/approve?token=${approvalToken}`;

  await resend.emails.send({
    from: "Halo <noreply@dbhalo.com>",
    to:   ADMIN_EMAIL,
    subject: `New account request — ${email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">New account request</h2>
        <p style="color:#64748b;margin:0 0 24px">Someone has requested access to Halo.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px">Email</td>
            <td style="padding:8px 0;font-size:14px;font-weight:600">${email}</td>
          </tr>
          ${name ? '<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600">' + name + '</td></tr>' : ""}
        </table>
        <a href="${approveUrl}"
           style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Approve account
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">
          Or copy this link:<br/>
          <span style="word-break:break-all">${approveUrl}</span>
        </p>
      </div>
    `,
  });

  return NextResponse.json({ pending: true }, { status: 201 });
}
