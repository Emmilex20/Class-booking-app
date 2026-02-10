import { auth } from "@clerk/nextjs/server";
import { addHours, format, isPast, isWithinInterval } from "date-fns";
import {
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AttendanceAlert } from "@/components/app/bookings/AttendanceAlert";
import { BookingCard } from "@/components/app/bookings/BookingCard";
import { BookingsCalendarView } from "@/components/app/bookings/BookingsCalendarView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUsageStats } from "@/lib/subscription";
import { sanityFetch } from "@/sanity/lib/live";
import { USER_BOOKINGS_QUERY } from "@/sanity/lib/queries/bookings";

export default async function BookingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [{ data: bookings }, usageStats] = await Promise.all([
    sanityFetch({ query: USER_BOOKINGS_QUERY, params: { clerkId: userId } }),
    getUsageStats(userId),
  ]);

  // Filter out bookings with invalid data
  const validBookings = bookings.filter(
    (b) => b.status && b.classSession?.startTime,
  );

  // Sort upcoming bookings (earliest first)
  const upcomingBookings = validBookings
    .filter(
      (b) =>
        b.status === "confirmed" &&
        b.classSession?.startTime &&
        !isPast(new Date(b.classSession.startTime)),
    )
    .sort((a, b) => {
      const aTime = a.classSession?.startTime
        ? new Date(a.classSession.startTime).getTime()
        : 0;
      const bTime = b.classSession?.startTime
        ? new Date(b.classSession.startTime).getTime()
        : 0;
      return aTime - bTime;
    });

  const now = new Date();
  const liveNowBookings = validBookings
    .filter((b) => b.status === "confirmed" || b.status === "attended")
    .filter((b) => {
      const startTime = b.classSession?.startTime;
      if (!startTime) return false;

      const start = new Date(startTime);
      const duration = b.classSession?.activity?.duration ?? 60;
      const end = addHours(start, duration / 60);

      return isWithinInterval(now, { start, end });
    })
    .sort((a, b) => {
      const aTime = a.classSession?.startTime
        ? new Date(a.classSession.startTime).getTime()
        : 0;
      const bTime = b.classSession?.startTime
        ? new Date(b.classSession.startTime).getTime()
        : 0;
      return aTime - bTime;
    });

  const featuredLiveBooking =
    liveNowBookings.length > 1
      ? [...liveNowBookings].sort((a, b) => {
          const aStart = a.classSession?.startTime
            ? new Date(a.classSession.startTime).getTime()
            : Number.POSITIVE_INFINITY;
          const bStart = b.classSession?.startTime
            ? new Date(b.classSession.startTime).getTime()
            : Number.POSITIVE_INFINITY;

          return (
            Math.abs(now.getTime() - aStart) - Math.abs(now.getTime() - bStart)
          );
        })[0]
      : null;

  const secondaryLiveBookings = featuredLiveBooking
    ? liveNowBookings.filter(
        (booking) => booking._id !== featuredLiveBooking._id,
      )
    : liveNowBookings;

  // Sort past bookings (most recent first)
  const pastBookings = validBookings
    .filter(
      (b) =>
        b.status !== "confirmed" ||
        (b.classSession?.startTime &&
          isPast(new Date(b.classSession.startTime))),
    )
    .sort((a, b) => {
      const aTime = a.classSession?.startTime
        ? new Date(a.classSession.startTime).getTime()
        : 0;
      const bTime = b.classSession?.startTime
        ? new Date(b.classSession.startTime).getTime()
        : 0;
      return bTime - aTime;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-linear-to-r from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming and past fitness classes
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Attendance Confirmation Alert */}
        <AttendanceAlert bookings={bookings} />

        {/* Live Shortcuts */}
        <section>
          <div className="mb-6 flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Join Live Now</h2>
            <Badge variant="secondary" className="ml-2">
              {liveNowBookings.length}
            </Badge>
          </div>
          {liveNowBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No live classes right now
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {featuredLiveBooking && (
                <Card className="border-primary/40 bg-primary/5">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="default">Recommended</Badge>
                      </div>
                      <p className="truncate font-semibold">
                        {featuredLiveBooking.classSession?.activity?.name ??
                          "Live class"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {featuredLiveBooking.classSession?.venue?.name ??
                          "Unknown Venue"}{" "}
                        •{" "}
                        {featuredLiveBooking.classSession?.startTime
                          ? format(
                              new Date(
                                featuredLiveBooking.classSession.startTime,
                              ),
                              "h:mm a",
                            )
                          : "Time unavailable"}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link
                        href={`/classes/${featuredLiveBooking.classSession?._id}/live`}
                      >
                        Open Live Form
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              {secondaryLiveBookings.map((booking) => (
                <Card key={booking._id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {booking.classSession?.activity?.name ?? "Live class"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.classSession?.venue?.name ?? "Unknown Venue"} •{" "}
                        {booking.classSession?.startTime
                          ? format(
                              new Date(booking.classSession.startTime),
                              "h:mm a",
                            )
                          : "Time unavailable"}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/classes/${booking.classSession?._id}/live`}>
                        Open Live Form
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Calendar View */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Calendar View</h2>
          </div>
          <BookingsCalendarView bookings={bookings} />
        </section>

        {/* Upcoming Bookings */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Upcoming Classes</h2>
            <Badge variant="secondary" className="ml-2">
              {upcomingBookings.length}
            </Badge>
          </div>
          {upcomingBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  No upcoming classes
                </p>
                <Button asChild>
                  <Link href="/classes">
                    Browse classes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} showActions />
              ))}
            </div>
          )}
        </section>

        {/* Usage Stats - we dont show this if the user is on the champion tier as they have unlimited classes */}
        {usageStats.tier !== "champion" && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Usage
              </CardTitle>
              <CardDescription>
                Track your class attendance this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageStats.tier ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="capitalize">
                      {usageStats.tier} Tier
                    </Badge>
                    <span className="font-semibold text-lg">
                      {usageStats.limit === Infinity
                        ? `${usageStats.used} classes used`
                        : `${usageStats.used} / ${usageStats.limit} classes`}
                    </span>
                  </div>
                  {usageStats.limit !== Infinity && (
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.min((usageStats.used / usageStats.limit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  {usageStats.limit !== Infinity && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {usageStats.limit - usageStats.used > 0
                        ? `${usageStats.limit - usageStats.used} classes remaining this month`
                        : "You've used all your classes this month"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    No active subscription
                  </p>
                  <Button asChild>
                    <Link href="/upgrade">
                      View subscription plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Past Bookings */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-muted-foreground">
              Past Classes
            </h2>
            <Badge variant="outline" className="ml-2">
              {pastBookings.length}
            </Badge>
          </div>
          {pastBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No past classes yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
