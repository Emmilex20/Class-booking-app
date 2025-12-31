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
    return <p className="text-muted-foreground">No pending requests</p>;
  }

  return (
    <div className="grid gap-4">
      {items.map((r) => (
        <Card key={r._id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <div className="text-sm text-muted-foreground">
                {r.requester?.name || r.requester?.email}
                {r._createdAt ? ` • ${new Date(r._createdAt).toLocaleString()}` : ""}
              </div>
              <div className="mt-2 text-sm">
                <div className="prose max-w-none">
                  {/* description may be portable text; show a short fallback */}
                  {r.description ? JSON.stringify(r.description).slice(0, 180) : "No description"}
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  {r.categoryName && <Badge variant="secondary">{r.categoryName}</Badge>}
                  {r.instructor && <Badge variant="secondary">Instructor: {r.instructor}</Badge>}
                  {r.duration && <Badge variant="secondary">{r.duration} min</Badge>}
                </div>
                {r.suggestedVenue?.name && (
                  <div className="mt-2 text-sm">Suggested: {r.suggestedVenue.name} {r.suggestedVenue.address ? `• ${r.suggestedVenue.address}` : ""}</div>
                )}
                {r.preferredTimes?.length ? (
                  <div className="mt-2 text-sm">Preferred times: {r.preferredTimes.map((t) => new Date(t).toLocaleString()).join(", ")}</div>
                ) : null}
              </div>
            </div>

            <div className="ml-4 flex flex-col gap-2">
              <Button onClick={() => handleApprove(r._id)} disabled={!!processing || processing === r._id} className="bg-success text-white">Approve</Button>
              <Button variant="ghost" onClick={() => handleReject(r._id)} disabled={!!processing || processing === r._id}>Reject</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
