"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type UserItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  isAdmin: boolean;
  createdAt: string | null;
};

export default function UsersAdminList({ initial }: { initial: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initial || []);
  const [processing, setProcessing] = useState<string | null>(null);

  async function toggleAdmin(userId: string, makeAdmin: boolean) {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/admin`, {
        method: makeAdmin ? "POST" : "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isAdmin: makeAdmin } : u)));
      } else {
        alert("Failed: " + (json.error || "unknown"));
      }
    } catch (err: any) {
      alert(err.message || String(err));
    } finally {
      setProcessing(null);
    }
  }

  if (!users.length) return <p className="text-muted-foreground">No users found</p>;

  return (
    <div className="grid gap-4">
      {users.map((u) => (
        <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            {u.profileImageUrl ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src={u.profileImageUrl} alt={u.email ?? "user"} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted" />
            )}
            <div>
              <div className="font-semibold">{(u.firstName || "") + (u.lastName ? ` ${u.lastName}` : "") || u.email}</div>
              <div className="text-sm text-muted-foreground">{u.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {u.isAdmin ? <Badge>Admin</Badge> : <Badge variant="secondary">User</Badge>}
            <Button size="sm" onClick={() => toggleAdmin(u.id, !u.isAdmin)} disabled={!!processing && processing !== u.id}>
              {u.isAdmin ? "Revoke" : "Make admin"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
