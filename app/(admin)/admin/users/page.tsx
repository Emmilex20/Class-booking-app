import { requireAdmin } from "@/lib/auth/requireAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import UsersAdminList from "@/components/admin/UsersAdminList";

export default async function AdminUsersPage() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="text-muted-foreground mt-2">You must be an admin to view this page.</p>
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin users</h1>
          <p className="text-muted-foreground">Manage admin privileges for your workspace</p>
        </div>
      </div>

      <UsersAdminList initial={safe} />
    </div>
  );
}
