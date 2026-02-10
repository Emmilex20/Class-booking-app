import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const bodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ userId: string }>;
}

async function getUserId(context: RouteContext): Promise<string | null> {
  const paramsResolved = await context.params;
  return paramsResolved?.userId ?? null;
}

export async function PATCH(req: Request, context: RouteContext) {
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
    const parsed = bodySchema.parse(await req.json());
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 400 },
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
    await clerk.users.deleteUser(userId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
