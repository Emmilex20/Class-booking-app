import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

const bodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
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
    const parsed = bodySchema.parse(await req.json());
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId as string, {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 400 });
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
    await clerk.users.deleteUser(userId as string);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
