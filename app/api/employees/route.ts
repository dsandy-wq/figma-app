import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Employees are managed in the Halo platform." }, { status: 405 });
}
