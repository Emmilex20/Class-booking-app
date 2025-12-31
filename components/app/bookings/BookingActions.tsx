"use client";

import { useState, useTransition } from "react";
import { confirmAttendance } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";

interface BookingActionsProps {
  bookingId: string;
  canConfirmAttendance: boolean;
  isPast: boolean;
}

export function BookingActions({ bookingId, canConfirmAttendance }: BookingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmAttendance(bookingId);
      if (!result.success) {
        setError(result.error || "Failed to confirm attendance");
        return;
      }
      setConfirmed(true);
      // Optionally, you can refresh the page or revalidate
    });
  };

  if (confirmed) {
    return (
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-semibold">Confirmed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleConfirm}
        disabled={!canConfirmAttendance || isPending}
        size="sm"
      >
        {isPending ? "Confirming…" : "Confirm Attendance"}
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
