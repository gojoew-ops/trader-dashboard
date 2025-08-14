import { NextRequest, NextResponse } from "next/server";
import { addSignal } from "@/lib/store";

export async function POST(req: NextRequest) {
  // Optional shared secret: set env ALERT_SECRET on Vercel.
  const requiredSecret = process.env.ALERT_SECRET;
  if (requiredSecret) {
    const got = req.headers.get("x-alert-secret");
    if (got !== requiredSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json();
    const ticker = String(body.ticker || body.symbol || "UNKNOWN").toUpperCase();
    const action = String(body.action || "ALERT").toUpperCase() as "BUY" | "SELL" | "ALERT";
    const note = typeof body.note === "string" ? body.note : undefined;

    const time = new Date().toISOString();

    addSignal({ time, ticker, action, note });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
}