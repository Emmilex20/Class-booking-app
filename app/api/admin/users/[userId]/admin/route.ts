import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

async function getUserId(context: RouteContext): Promise<string | null> {
  const paramsResolved = await context.params;
  return paramsResolved?.userId ?? null;
}

export async function POST(_req: Request, context: RouteContext) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, error: "Access denied" },
      { status: 403 },
    );
  }

  const userId = await getUserId(context);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Missing userId" },
      { status: 400 },
    );
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const publicMetadata = { ...(user.publicMetadata || {}), isAdmin: true };
    await clerk.users.updateUser(userId, { publicMetadata });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json(
      { ok: false, error: "Access denied" },
      { status: 403 },
    );
  }

  const userId = await getUserId(context);
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Missing userId" },
      { status: 400 },
    );
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const publicMetadata = { ...(user.publicMetadata || {}) };
    delete publicMetadata.isAdmin;
    await clerk.users.updateUser(userId, { publicMetadata });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
