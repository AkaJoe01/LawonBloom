import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "cache-control": "no-store" };
  let db;
  try {
    db = getDb();
    await db.$queryRaw`SELECT 1`;
  } catch {
    return NextResponse.json({ ok: false, db: "down", migrations: 0 }, { status: 503, headers });
  }

  let migrations = 0;
  try {
    const rows = await db.$queryRaw<{ n: number }[]>`SELECT count(*)::int AS n FROM _prisma_migrations WHERE finished_at IS NOT NULL`;
    migrations = rows[0]?.n ?? 0;
  } catch {
    migrations = 0;
  }

  return NextResponse.json({ ok: true, db: "up", migrations }, { headers });
}
