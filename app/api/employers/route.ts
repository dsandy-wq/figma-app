import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Employers are managed in the Halo platform." }, { status: 405 });
}
