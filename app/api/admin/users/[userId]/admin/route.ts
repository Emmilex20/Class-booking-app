import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
  }

  const paramsResolved = await params as { userId?: string };
  const userId = paramsResolved?.userId;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId as string);
    const publicMetadata = { ...(user.publicMetadata || {}), isAdmin: true };
    await clerk.users.updateUser(userId as string, { publicMetadata });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
  }

  const paramsResolved = await params as { userId?: string };
  const userId = paramsResolved?.userId;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId as string);
    const publicMetadata = { ...(user.publicMetadata || {}) };
    delete publicMetadata.isAdmin;
    await clerk.users.updateUser(userId as string, { publicMetadata });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
