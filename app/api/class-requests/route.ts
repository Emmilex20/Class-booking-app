import { NextResponse } from "next/server";
import { z } from "zod";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";

const bodySchema = z.object({
  title: z.string().min(3),
  description: z.any().optional(),
  instructor: z.string().optional(),
  duration: z.number().optional(),
  categoryName: z.string().optional(),
  suggestedVenue: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      venueRef: z.string().optional(),
    })
    .optional(),
  preferredTimes: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.parse(body);

    // Extract Clerk user info if provided via headers (serverless contexts)
    const clerkId = req.headers.get("x-clerk-id") || null;
    const email = req.headers.get("x-clerk-email") || null;
    const name = req.headers.get("x-clerk-name") || null;

    if (!writeClient.config().token) {
      console.error('SANITY_API_TOKEN is not set — cannot create documents');
      return NextResponse.json({ ok: false, error: 'Server misconfiguration: missing SANITY_API_TOKEN' }, { status: 500 });
    }

    const doc = {
      _type: "classRequest",
      title: parsed.title,
      description: parsed.description,
      instructor: parsed.instructor,
      duration: parsed.duration,
      categoryName: parsed.categoryName,
      suggestedVenue: parsed.suggestedVenue,
      preferredTimes: parsed.preferredTimes,
      requester: { clerkId, email, name },
      status: "pending",
    };

    const result = await writeClient.create(doc);

    // TODO: trigger notification to admins (email or in-app)

    return NextResponse.json({ ok: true, id: result._id });
  } catch (err) {
    console.error(err);

    const msg = (err as any)?.message || '';
    const body = (err as any)?.responseBody || '';
    const hasInsufficient =
      msg.includes('Insufficient permissions') ||
      (typeof body === 'string' && body.includes('Insufficient permissions'));

    if (hasInsufficient) {
      return NextResponse.json({ ok: false, error: 'Sanity token lacks create permission. Set SANITY_API_TOKEN to a token with create/mutation permissions.' }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: msg || 'Unknown error' }, { status: 400 });
  }
}