import { NextRequest, NextResponse } from "next/server";
import { getSignals } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 50);
  const data = getSignals(isFinite(limit) ? limit : 50);
  return NextResponse.json({ ok: true, data });
}