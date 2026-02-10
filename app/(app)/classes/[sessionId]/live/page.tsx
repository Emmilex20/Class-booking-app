import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import Link from "next/link";

import { LiveStreamVideoPlayer } from "@/components/app/classes/LiveStreamVideoPlayer";
import { sanityFetch } from "@/sanity/lib/live";
import { ATTENDEES_FOR_SESSION_QUERY } from "@/sanity/lib/queries/attendees";
import { SESSION_BY_ID_QUERY } from "@/sanity/lib/queries/sessions";

interface PageProps {
  params: { sessionId: string };
}

interface SessionPayload {
  startTime?: string | null;
  liveStreamUrl?: string | null;
  activity?: {
    name?: string | null;
    duration?: number | null;
  } | null;
  venue?: {
    name?: string | null;
  } | null;
}

interface Attendee {
  _id: string;
  status?: string | null;
  user?: {
    imageUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

function getEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "youtu.be") {
      const videoId = url.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host.includes("player.vimeo.com")) {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
}

function isDirectVideoUrl(raw: string): boolean {
  const normalized = raw.toLowerCase();
  return (
    normalized.includes(".mp4") ||
    normalized.includes(".webm") ||
    normalized.includes(".ogg") ||
    normalized.includes(".m3u8")
  );
}

function getPayload(r: unknown): unknown {
  if (!r) return null;
  if (typeof r !== "object") return r;

  const obj = r as Record<string, unknown>;
  if (!("data" in obj)) return obj;

  const data = obj.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const dataObj = data as Record<string, unknown>;
  if ("session" in dataObj) return dataObj.session;

  return data;
}

export default async function LivePage({ params }: PageProps) {
  const { sessionId } = (await params) as { sessionId: string };

  const [sessionRes, attendeesRes] = await Promise.all([
    sanityFetch({ query: SESSION_BY_ID_QUERY, params: { sessionId } }),
    sanityFetch({ query: ATTENDEES_FOR_SESSION_QUERY, params: { sessionId } }),
  ]);

  const rawSession = getPayload(sessionRes);
  const rawAttendees = getPayload(attendeesRes);

  if (
    !rawSession ||
    typeof rawSession !== "object" ||
    Array.isArray(rawSession)
  ) {
    return <div className="p-8">Session not found</div>;
  }

  const session = rawSession as SessionPayload;

  const attendees: Attendee[] = Array.isArray(rawAttendees)
    ? rawAttendees.filter((a): a is Attendee => {
        if (!a || typeof a !== "object" || Array.isArray(a)) return false;
        return typeof (a as Record<string, unknown>)._id === "string";
      })
    : [];

  const start = new Date(session.startTime ?? new Date().toISOString());
  const duration = session.activity?.duration ?? 60;
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const now = new Date();
  const isLive = now >= start && now <= end;

  const liveStreamUrl =
    typeof session.liveStreamUrl === "string"
      ? session.liveStreamUrl.trim()
      : "";
  const embedUrl = liveStreamUrl ? getEmbedUrl(liveStreamUrl) : null;
  const directVideoUrl =
    liveStreamUrl && isDirectVideoUrl(liveStreamUrl) ? liveStreamUrl : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Live - {session.activity?.name}
          </h1>
          <p className="text-muted-foreground">
            {session.venue?.name} |{" "}
            {new Date(session.startTime ?? "").toLocaleString()}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {isLive ? (
            <span className="text-emerald-600 font-semibold">Live now</span>
          ) : (
            <span>Ended {formatDistanceToNowStrict(end)} ago</span>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-muted">
        <h2 className="font-semibold mb-2">Stream</h2>
        <div className="mb-4 text-sm text-muted-foreground">
          Join the live stream below.
        </div>

        {isLive ? (
          liveStreamUrl ? (
            <div className="aspect-video bg-black rounded-md overflow-hidden">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="h-full w-full"
                  title={`Live stream for ${session.activity?.name ?? "class"}`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : directVideoUrl ? (
                <LiveStreamVideoPlayer
                  src={directVideoUrl}
                  title={`Live stream for ${session.activity?.name ?? "class"}`}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center px-6 text-center text-white">
                  Stream URL is not embeddable. Use the link below.
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-black rounded-md flex items-center justify-center text-white">
              Tutor has not started the stream yet.
            </div>
          )
        ) : (
          <div className="aspect-video bg-black/10 rounded-md flex items-center justify-center">
            Recording will appear here after the class
          </div>
        )}

        {isLive && liveStreamUrl && !embedUrl && !directVideoUrl ? (
          <div className="mt-3">
            <a
              href={liveStreamUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              Open live stream
            </a>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="font-semibold mb-3">Attendees ({attendees.length})</h3>
        <ul className="space-y-2">
          {attendees.map((a) => (
            <li key={a._id} className="flex items-center gap-3">
              {a.user?.imageUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={a.user.imageUrl}
                    alt={a.user?.firstName ?? a.user?.email ?? "attendee"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted" />
              )}
              <div>
                <div className="font-medium">
                  {(a.user?.firstName ?? "") +
                    (a.user?.lastName ? ` ${a.user.lastName}` : "") ||
                    a.user?.email}
                </div>
                <div className="text-sm text-muted-foreground">{a.status}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Link href="/bookings" className="text-sm text-primary">
          Back to Bookings
        </Link>
      </div>
    </div>
  );
}
