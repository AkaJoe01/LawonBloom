import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { adminMutationGate, requireAdmin } from "@/lib/auth/guards";
import { generatePassword, hashPassword } from "@/lib/auth/password";
import { originRejection } from "@/lib/security/origin";
import { userCreateSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const db = getDb();
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      totpEnabled: true,
      lockedUntil: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const gate = await adminMutationGate(guard.session.user.id);
  if (gate) return gate;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_json", message: "Invalid JSON body." } }, { status: 400 });
  }
  const parsed = userCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation", message: parsed.error.issues[0]?.message ?? "Invalid input." } },
      { status: 400 },
    );
  }

  const db = getDb();
  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json(
      { error: { code: "duplicate_email", message: "An account with this email already exists." } },
      { status: 409 },
    );
  }

  const displayOncePassword = generatePassword();
  const passwordHash = await hashPassword(displayOncePassword);
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: "EDITOR",
    },
    select: { id: true, email: true, name: true },
  });

  console.info(
    JSON.stringify({ event: "editor_created", adminId: guard.session.user.id, editorId: user.id }),
  );

  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name, displayOncePassword },
    { status: 201 },
  );
}
