import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
