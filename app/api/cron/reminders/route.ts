import { NextResponse } from "next/server";
import { Resend } from "resend";
import { UPCOMING_BOOKINGS_FOR_REMINDERS_QUERY } from "@/sanity/lib/queries/bookings";
import { writeClient } from "@/sanity/lib/writeClient";

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

type ReminderKind = "24h" | "1h";

interface ReminderCandidate {
  _id: string;
  reminder24hSentAt?: string | null;
  reminder1hSentAt?: string | null;
  user?: {
    firstName?: string | null;
    email?: string | null;
  } | null;
  classSession?: {
    _id?: string | null;
    startTime?: string | null;
    activity?: {
      name?: string | null;
    } | null;
    venue?: {
      name?: string | null;
    } | null;
  } | null;
}

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

function classifyReminder(
  booking: ReminderCandidate,
  nowMs: number,
): ReminderKind | null {
  const startTime = booking.classSession?.startTime;
  if (!startTime) return null;

  const startMs = new Date(startTime).getTime();
  const diffMs = startMs - nowMs;

  const isIn24hWindow = diffMs >= 23 * HOUR_MS && diffMs <= 25 * HOUR_MS;
  if (isIn24hWindow && !booking.reminder24hSentAt) {
    return "24h";
  }

  const isIn1hWindow = diffMs >= 45 * MINUTE_MS && diffMs <= 75 * MINUTE_MS;
  if (isIn1hWindow && !booking.reminder1hSentAt) {
    return "1h";
  }

  return null;
}

function buildReminderEmail({
  booking,
  kind,
  appBaseUrl,
}: {
  booking: ReminderCandidate;
  kind: ReminderKind;
  appBaseUrl: string;
}) {
  const sessionName = booking.classSession?.activity?.name ?? "your class";
  const venueName = booking.classSession?.venue?.name ?? "your venue";
  const startIso = booking.classSession?.startTime ?? "";
  const startDate = startIso ? new Date(startIso) : new Date();
  const recipientName = booking.user?.firstName?.trim() || "there";
  const relative = kind === "24h" ? "in 24 hours" : "in about 1 hour";
  const liveLink = booking.classSession?._id
    ? `${appBaseUrl}/classes/${booking.classSession._id}/live`
    : null;

  const subject =
    kind === "24h"
      ? `Reminder: ${sessionName} is tomorrow`
      : `Starting soon: ${sessionName}`;

  const startLabel = startDate.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const text = [
    `Hi ${recipientName},`,
    "",
    `This is a reminder that ${sessionName} starts ${relative}.`,
    `When: ${startLabel}`,
    `Where: ${venueName}`,
    liveLink ? `Live form: ${liveLink}` : "",
    "",
    "See you soon.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <p>Hi ${recipientName},</p>
      <p>This is a reminder that <strong>${sessionName}</strong> starts ${relative}.</p>
      <p><strong>When:</strong> ${startLabel}<br/><strong>Where:</strong> ${venueName}</p>
      ${liveLink ? `<p><a href="${liveLink}">Open live form</a></p>` : ""}
      <p>See you soon.</p>
    </div>
  `;

  return { subject, text, html };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!writeClient.config().token) {
    return NextResponse.json(
      { ok: false, error: "Server misconfiguration: missing SANITY_API_TOKEN" },
      { status: 500 },
    );
  }

  if (!process.env.RESEND_API_KEY || !process.env.REMINDER_FROM_EMAIL) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Server misconfiguration: missing RESEND_API_KEY or REMINDER_FROM_EMAIL",
      },
      { status: 500 },
    );
  }

  const now = new Date();
  const nowMs = now.getTime();
  const windowStart = now.toISOString();
  const windowEnd = new Date(nowMs + 26 * HOUR_MS).toISOString();

  const resend = new Resend(process.env.RESEND_API_KEY);
  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const candidates = await writeClient.fetch<ReminderCandidate[]>(
    UPCOMING_BOOKINGS_FOR_REMINDERS_QUERY,
    { windowStart, windowEnd },
  );

  const toSend = candidates
    .map((booking) => ({ booking, kind: classifyReminder(booking, nowMs) }))
    .filter(
      (
        item,
      ): item is {
        booking: ReminderCandidate;
        kind: ReminderKind;
      } => !!item.kind && !!item.booking.user?.email,
    );

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      candidateCount: candidates.length,
      queuedCount: toSend.length,
      queued: toSend.map(({ booking, kind }) => ({
        bookingId: booking._id,
        sessionId: booking.classSession?._id ?? null,
        email: booking.user?.email ?? null,
        kind,
      })),
    });
  }

  const sent: Array<{ bookingId: string; kind: ReminderKind; email: string }> =
    [];
  const failed: Array<{ bookingId: string; error: string }> = [];

  for (const item of toSend) {
    const email = item.booking.user?.email;
    if (!email) continue;

    const message = buildReminderEmail({
      booking: item.booking,
      kind: item.kind,
      appBaseUrl,
    });

    try {
      const sendResult = await resend.emails.send({
        from: process.env.REMINDER_FROM_EMAIL,
        to: email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });

      if (sendResult.error) {
        failed.push({
          bookingId: item.booking._id,
          error: sendResult.error.message || "Resend API error",
        });
        continue;
      }

      const sentAtField =
        item.kind === "24h"
          ? { reminder24hSentAt: now.toISOString() }
          : { reminder1hSentAt: now.toISOString() };
      await writeClient.patch(item.booking._id).set(sentAtField).commit();

      sent.push({ bookingId: item.booking._id, kind: item.kind, email });
    } catch (error) {
      failed.push({
        bookingId: item.booking._id,
        error: error instanceof Error ? error.message : "Unknown send error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    checked: candidates.length,
    queued: toSend.length,
    sent: sent.length,
    failed: failed.length,
    sentItems: sent,
    failedItems: failed,
  });
}
