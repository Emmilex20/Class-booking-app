"use client";

import React, { useEffect, useState } from "react";

export default function UsersCount() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/users", { credentials: "same-origin" });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json?.error || "Failed to load");
          setCount(null);
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setCount(Array.isArray(json.users) ? json.users.length : 0);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || String(err));
          setCount(null);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <span className="text-base text-muted-foreground">—</span>;
  if (count === null) return <span className="text-base text-muted-foreground">…</span>;
  return <span>{count}</span>;
}
