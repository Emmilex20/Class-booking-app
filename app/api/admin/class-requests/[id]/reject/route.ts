import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const bodySchema = z.object({ adminNote: z.string().optional() });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[pathParts.length - 3]; // /api/admin/class-requests/[id]/reject

    // Require admin
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) {
      return NextResponse.json({ ok: false, error: adminCheck.message }, { status: adminCheck.status });
    }

    const parsed = bodySchema.parse(await req.json());

    const requestDoc = await client.fetch(`*[_type == "classRequest" && _id == $id][0]`, { id });
    if (!requestDoc) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    // Try to resolve admin user profile from header
    const adminClerkId = req.headers.get("x-clerk-id") || null;
    let approvedByRef = null;
    if (adminClerkId) {
      const profileId = await client.fetch(`*[_type=="userProfile" && clerkId == $id][0]._id`, { id: adminClerkId });
      if (profileId) approvedByRef = { _type: "reference", _ref: profileId };
    }

    if (!writeClient.config().token) {
      console.error('SANITY_API_TOKEN is not set — cannot update documents');
      return NextResponse.json({ ok: false, error: 'Server misconfiguration: missing SANITY_API_TOKEN' }, { status: 500 });
    }

    const patch = writeClient.patch(id).set({
      status: "rejected",
      adminNote: parsed.adminNote || "",
      approvedAt: new Date().toISOString(),
    });

    if (approvedByRef) patch.set({ approvedBy: approvedByRef });

    await patch.commit();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);

    const msg = (err as any)?.message || '';
    const body = (err as any)?.responseBody || '';
    const hasInsufficient =
      msg.includes('Insufficient permissions') ||
      (typeof body === 'string' && body.includes('Insufficient permissions'));

    if (hasInsufficient) {
      return NextResponse.json({ ok: false, error: 'Sanity token lacks permission to update documents. Set SANITY_API_TOKEN to a token with mutation permissions.' }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: msg || 'Unknown error' }, { status: 400 });
  }
}
