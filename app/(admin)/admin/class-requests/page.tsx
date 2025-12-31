import { sanityFetch } from "@/sanity/lib/live";
import { PENDING_CLASS_REQUESTS_QUERY } from "@/sanity/lib/queries/classRequests";
import { RequestsList } from "./RequestsList";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function ClassRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    // Not an admin — redirect to home (or show 403)
    redirect("/");
  }

  const res = await sanityFetch({ query: PENDING_CLASS_REQUESTS_QUERY }).catch(() => ({ data: [] }));
  const requests = res.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Class requests</h1>
          <p className="text-muted-foreground">Review user-submitted class requests</p>
        </div>
      </div>

      <RequestsList initial={requests} />
    </div>
  );
}
