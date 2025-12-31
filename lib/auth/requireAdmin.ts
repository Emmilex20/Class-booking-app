import { auth, clerkClient } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return { ok: false, status: 401, message: "Authentication required" };

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const isAdminFromMetadata = Boolean(user?.publicMetadata?.isAdmin);

  const adminIds = (process.env.CLERK_ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const adminEmails = (process.env.CLERK_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  const isInAdminList = adminIds.includes(userId) || (email && adminEmails.includes(email));

  if (!isAdminFromMetadata && !isInAdminList) {
    return { ok: false, status: 403, message: "Admin privileges required" };
  }

  return { ok: true, user };
}
