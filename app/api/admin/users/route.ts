import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
  }

  const clerk = await clerkClient();
  const usersRes = await clerk.users.getUserList({ limit: 100 });
  const usersArr = Array.isArray(usersRes) ? usersRes : (usersRes?.data ?? []);

  const safe = usersArr.map((u: any) => ({
    id: u.id,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    email: u.emailAddresses?.[0]?.emailAddress ?? null,
    profileImageUrl: u.profileImageUrl ?? null,
    isAdmin: Boolean(u.publicMetadata?.isAdmin),
    createdAt: u.createdAt,
  }));

  return NextResponse.json({ ok: true, users: safe });
}
