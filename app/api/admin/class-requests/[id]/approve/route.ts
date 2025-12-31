import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const bodySchema = z.object({
  adminNote: z.string().optional(),
  createSessions: z.boolean().optional().default(true),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[pathParts.length - 3]; // /api/admin/class-requests/[id]/approve

    // Require admin
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) {
      return NextResponse.json({ ok: false, error: adminCheck.message }, { status: adminCheck.status });
    }

    const parsed = bodySchema.parse(await req.json());

    // Fetch the request
    const requestDoc = await client.fetch(`*[_type == "classRequest" && _id == $id][0]`, { id });
    if (!requestDoc) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    // Resolve or create category if provided
    let categoryRef = null;
    if (requestDoc.categoryName) {
      const existing = await client.fetch(`*[_type == "category" && name == $name][0]._id`, { name: requestDoc.categoryName });
      if (existing) {
        categoryRef = { _type: "reference", _ref: existing };
      } else {
        if (!writeClient.config().token) {
          console.error('SANITY_API_TOKEN is not set — cannot create documents');
          return NextResponse.json({ ok: false, error: 'Server misconfiguration: missing SANITY_API_TOKEN' }, { status: 500 });
        }

        const cat = await writeClient.create({
          _type: "category",
          name: requestDoc.categoryName,
          slug: { current: slugify(requestDoc.categoryName) },
        });
        categoryRef = { _type: "reference", _ref: cat._id };
      }
    }

    // Create activity document
    const activityDoc: any = {
      _type: "activity",
      name: requestDoc.title,
      slug: { current: slugify(requestDoc.title) },
      instructor: requestDoc.instructor || "TBD",
      description: requestDoc.description || [],
      duration: requestDoc.duration || 60,
      tierLevel: "basic",
    };

    if (categoryRef) activityDoc.category = categoryRef;

    const activity = await writeClient.create(activityDoc);

    // Optionally create sessions if preferredTimes + venueRef exist
    const sessionIds: string[] = [];
    if (parsed.createSessions && Array.isArray(requestDoc.preferredTimes) && requestDoc.preferredTimes.length > 0) {
      const venueRef = requestDoc.suggestedVenue?.venueRef || null;
      if (venueRef) {
        for (const t of requestDoc.preferredTimes) {
          const session = await writeClient.create({
            _type: "classSession",
            activity: { _type: "reference", _ref: activity._id },
            venue: { _type: "reference", _ref: venueRef },
            startTime: t,
            maxCapacity: 20,
            status: "scheduled",
          });
          sessionIds.push(session._id);
        }
      }
    }

    // Resolve approving admin from clerk user id
    const adminUser = adminCheck.user;
    let approvedByRef = null;
    if (adminUser?.id) {
      const profileId = await client.fetch(`*[_type=="userProfile" && clerkId == $id][0]._id`, { id: adminUser.id });
      if (profileId) approvedByRef = { _type: "reference", _ref: profileId };
    }

    // Update the classRequest doc
    const patch = writeClient.patch(id).set({
      status: "approved",
      adminNote: parsed.adminNote || "",
      approvedAt: new Date().toISOString(),
    });

    if (approvedByRef) patch.set({ approvedBy: approvedByRef });

    await patch.commit();

    return NextResponse.json({ ok: true, activityId: activity._id, sessionIds });
  } catch (err) {
    console.error(err);

    const msg = (err as any)?.message || '';
    const body = (err as any)?.responseBody || '';
    const hasInsufficient =
      msg.includes('Insufficient permissions') ||
      (typeof body === 'string' && body.includes('Insufficient permissions'));

    if (hasInsufficient) {
      return NextResponse.json({ ok: false, error: 'Sanity token lacks create/patch permission. Set SANITY_API_TOKEN to a token with mutation permissions.' }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: msg || 'Unknown error' }, { status: 400 });
  }
}
