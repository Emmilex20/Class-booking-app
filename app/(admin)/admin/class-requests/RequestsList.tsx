"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RequestItem = {
  _id: string;
  title: string;
  description?: any;
  instructor?: string;
  duration?: number;
  categoryName?: string;
  suggestedVenue?: any;
  preferredTimes?: string[];
  requester?: { name?: string; email?: string };
  _createdAt?: string;
};

export function RequestsList({ initial }: { initial: RequestItem[] }) {
  const [items, setItems] = useState<RequestItem[]>(initial || []);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/class-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ createSessions: true }),
      });
      const json = await res.json();
      if (json.ok) {
        setItems((s) => s.filter((it) => it._id !== id));
        alert("Approved — activity created");
      } else {
        alert("Failed: " + (json.error || "unknown"));
      }
    } catch (err) {
      alert((err as any).message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id: string) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/class-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ adminNote: "Rejected by admin" }),
      });
      const json = await res.json();
      if (json.ok) {
        setItems((s) => s.filter((it) => it._id !== id));
        alert("Rejected");
      } else {
        alert("Failed: " + (json.error || "unknown"));
      }
    } catch (err) {
      alert((err as any).message);
    } finally {
      setProcessing(null);
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        No pending requests
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      {items.map((r) => (
        <Card
          key={r._id}
          className="p-4 sm:p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left content */}
            <div className="flex-1 space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold leading-tight">
                {r.title}
              </h3>

              <div className="text-xs sm:text-sm text-muted-foreground">
                {r.requester?.name || r.requester?.email}
                {r._createdAt && (
                  <span className="mx-1">•</span>
                )}
                {r._createdAt &&
                  new Date(r._createdAt).toLocaleString()}
              </div>

              <div className="pt-2 text-sm text-muted-foreground leading-relaxed">
                {r.description
                  ? JSON.stringify(r.description).slice(0, 180)
                  : "No description provided."}
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 pt-3">
                {r.categoryName && (
                  <Badge variant="secondary">{r.categoryName}</Badge>
                )}
                {r.instructor && (
                  <Badge variant="secondary">
                    Instructor: {r.instructor}
                  </Badge>
                )}
                {r.duration && (
                  <Badge variant="secondary">{r.duration} min</Badge>
                )}
              </div>

              {/* Extra info */}
              {r.suggestedVenue?.name && (
                <div className="pt-3 text-sm">
                  <span className="font-medium">Suggested venue:</span>{" "}
                  {r.suggestedVenue.name}
                  {r.suggestedVenue.address && (
                    <span className="text-muted-foreground">
                      {" "}
                      • {r.suggestedVenue.address}
                    </span>
                  )}
                </div>
              )}

              {r.preferredTimes?.length ? (
                <div className="pt-2 text-sm">
                  <span className="font-medium">Preferred times:</span>{" "}
                  <span className="text-muted-foreground">
                    {r.preferredTimes
                      .map((t) =>
                        new Date(t).toLocaleString()
                      )
                      .join(", ")}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex flex-row lg:flex-col gap-2 lg:min-w-35">
              <Button
                onClick={() => handleApprove(r._id)}
                disabled={!!processing || processing === r._id}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {processing === r._id ? "Processing..." : "Approve"}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleReject(r._id)}
                disabled={!!processing || processing === r._id}
                className="w-full"
              >
                Reject
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
