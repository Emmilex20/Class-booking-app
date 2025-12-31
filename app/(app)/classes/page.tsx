import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { MapPinIcon, SparklesIcon } from "lucide-react";

import { sanityFetch } from "@/sanity/lib/live";
import {
  FILTERED_SESSIONS_QUERY,
  SEARCH_SESSIONS_QUERY,
} from "@/sanity/lib/queries/sessions";
import { CATEGORIES_QUERY } from "@/sanity/lib/queries/categories";
import { VENUE_NAME_BY_ID_QUERY } from "@/sanity/lib/queries/venues";
import { USER_BOOKED_SESSION_IDS_QUERY } from "@/sanity/lib/queries";

import { ClassesContent } from "@/components/app/classes/ClassesContent";
import { ClassesMapSidebar } from "@/components/app/maps/ClassesMapSidebar";
import { ClassSearch } from "@/components/app/classes/ClassSearch";
import { ClassesFilters } from "@/components/app/classes/ClassesFilters";
import RequestClassForm from "@/components/classes/RequestClassForm";

import { getUserPreferences } from "@/lib/actions/profile";
import {
  filterSessionsByDistance,
  getBoundingBox,
} from "@/lib/utils/distance";

import { Card } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    venue?: string;
    category?: string;
    tier?: string;
  }>;
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const { q, venue, category, tier } = await searchParams;
  const { userId } = await auth();

  const categoryIds = category ? category.split(",").filter(Boolean) : [];
  const tierLevels = tier ? tier.split(",").filter(Boolean) : [];

  /* -------------------------------------------------------------------------- */
  /* USER PREFERENCES                                                           */
  /* -------------------------------------------------------------------------- */
  const userPreferences = await getUserPreferences();

  if (!userPreferences?.location || !userPreferences?.searchRadius) {
    redirect("/onboarding");
  }

  const { location, searchRadius } = userPreferences;

  /* -------------------------------------------------------------------------- */
  /* GEO FILTERING                                                              */
  /* -------------------------------------------------------------------------- */
  const { minLat, maxLat, minLng, maxLng } = getBoundingBox(
    location.lat,
    location.lng,
    searchRadius,
  );

  const sessionsQuery = q
    ? sanityFetch({
        query: SEARCH_SESSIONS_QUERY,
        params: { searchTerm: q, minLat, maxLat, minLng, maxLng },
      })
    : sanityFetch({
        query: FILTERED_SESSIONS_QUERY,
        params: {
          venueId: venue || "",
          categoryIds,
          tierLevels,
          minLat,
          maxLat,
          minLng,
          maxLng,
        },
      });

  const venueNameQuery = venue
    ? sanityFetch({
        query: VENUE_NAME_BY_ID_QUERY,
        params: { venueId: venue },
      })
    : Promise.resolve({ data: null });

  const [
    sessionsResult,
    categoriesResult,
    bookedSessionsResult,
    venueNameResult,
  ] = await Promise.all([
    sessionsQuery,
    sanityFetch({ query: CATEGORIES_QUERY }),
    userId
      ? sanityFetch({
          query: USER_BOOKED_SESSION_IDS_QUERY,
          params: { clerkId: userId },
        })
      : Promise.resolve({ data: [] as string[] }), // Explicitly type the fallback
    venueNameQuery,
  ]);

  /* -------------------------------------------------------------------------- */
  /* DATA NORMALIZATION                                                         */
  /* -------------------------------------------------------------------------- */

  const sessions = sessionsResult.data
    .filter((s) => s.startTime !== null)
    .map((s) => ({
      ...s,
      startTime: s.startTime as string,
    }));

  const sessionsWithDistance = filterSessionsByDistance(
    sessions,
    location.lat,
    location.lng,
    searchRadius,
  );

  const grouped = new Map<string, typeof sessionsWithDistance>();
  for (const session of sessionsWithDistance) {
    const key = format(new Date(session.startTime), "yyyy-MM-dd");
    grouped.set(key, [...(grouped.get(key) || []), session]);
  }

  /* -------------------------------------------------------------------------- */
  /* ✅ FINAL FIXES                                                              */
  /* -------------------------------------------------------------------------- */

  // Explicitly filter out nulls and verify type to satisfy TypeScript
  const bookedSessionIds: string[] = Array.isArray(bookedSessionsResult.data)
    ? (bookedSessionsResult.data as (string | null)[])
        .filter((id): id is string => id !== null && typeof id === "string")
    : [];

  const venuesForMap = sessionsWithDistance
    .map((s) => s.venue)
    .filter(
      (v): v is NonNullable<typeof v> => v !== null,
    );

  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      <header className="border-b bg-background/70 backdrop-blur-md">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Discover Classes Near You
              </h1>
              <p className="max-w-lg text-muted-foreground">
                Find workouts, sessions, and experiences happening around you —
                tailored to your location and preferences.
              </p>
            </div>

            <Suspense fallback={null}>
              <ClassSearch className="w-full sm:w-80 lg:w-96" />
            </Suspense>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border bg-primary/5 px-4 py-3">
            <MapPinIcon className="h-4 w-4 text-primary" />
            <span className="text-sm">
              Showing classes within{" "}
              <strong>{searchRadius} km</strong> of{" "}
              <span className="font-medium text-primary">
                {location.address}
              </span>
            </span>

            <Link
              href="/profile"
              className="ml-auto text-sm font-semibold text-primary hover:underline"
            >
              Change
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[280px_1fr_420px]">
          <aside className="hidden xl:block">
            <Card className="sticky top-24 p-4">
              <ClassesFilters
                categories={categoriesResult.data}
                activeFilters={{
                  venueId: venue || null,
                  venueName: venueNameResult.data?.name || null,
                  categoryIds,
                  tierLevels,
                }}
              />
            </Card>
          </aside>

          <section className="space-y-12">
            <ClassesContent
              groupedSessions={Array.from(grouped.entries())}
              bookedSessionIds={bookedSessionIds}
            />

            <Card className="relative overflow-hidden border-primary/20 bg-primary/5">
              <div className="absolute right-4 top-4 text-primary/20">
                <SparklesIcon className="h-20 w-20" />
              </div>

              <div className="relative z-10 p-6">
                <h2 className="text-xl font-semibold">
                   Want to add a class?
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Do  so now and we’ll populate it on our list of classes.
                </p>

                <div className="mt-6">
                  <RequestClassForm />
                </div>
              </div>
            </Card>
          </section>

          <aside className="hidden xl:block">
            <Card className="sticky top-24 h-[calc(100vh-6rem)] overflow-hidden p-0">
              <ClassesMapSidebar
                venues={venuesForMap}
                userLocation={{
                  lat: location.lat,
                  lng: location.lng,
                }}
              />
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}