"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  function startEditing(u: UserItem) {
    setEditingUserId(u.id);
    setEditFirstName(u.firstName ?? "");
    setEditLastName(u.lastName ?? "");
  }

  function cancelEditing() {
    setEditingUserId(null);
    setEditFirstName("");
    setEditLastName("");
  }

  async function saveEdit(userId: string) {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ firstName: editFirstName, lastName: editLastName }),
      });
      const json = await res.json();
      if (json.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, firstName: editFirstName, lastName: editLastName } : u)));
        cancelEditing();
      } else {
        alert("Failed: " + (json.error || "unknown"));
      }
    } catch (err: any) {
      alert(err.message || String(err));
    } finally {
      setProcessing(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (json.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert("Failed: " + (json.error || "unknown"));
      }
    } catch (err: any) {
      alert(err.message || String(err));
    } finally {
      setProcessing(null);
    }
  }

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
              {editingUserId === u.id ? (
                <div className="mt-2 flex gap-2 items-center">
                  <Input value={editFirstName} onChange={(e) => setEditFirstName((e.target as HTMLInputElement).value)} placeholder="First name" className="w-40" />
                  <Input value={editLastName} onChange={(e) => setEditLastName((e.target as HTMLInputElement).value)} placeholder="Last name" className="w-40" />
                  <Button size="sm" onClick={() => saveEdit(u.id)} disabled={!!processing && processing !== u.id}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing} disabled={!!processing && processing !== u.id}>Cancel</Button>
                </div>
              ) : null} 
            </div>
          </div>

          <div className="flex items-center gap-3">
            {u.isAdmin ? <Badge>Admin</Badge> : <Badge variant="secondary">User</Badge>}
            <Button size="sm" onClick={() => toggleAdmin(u.id, !u.isAdmin)} disabled={!!processing && processing !== u.id}>
              {u.isAdmin ? "Revoke" : "Make admin"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => startEditing(u)} disabled={!!processing && processing !== u.id}>
              Edit
            </Button>
            <Button size="sm" className="bg-red-600 text-white" onClick={() => deleteUser(u.id)} disabled={!!processing && processing !== u.id}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
