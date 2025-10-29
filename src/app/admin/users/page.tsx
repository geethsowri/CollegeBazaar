"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface U {
  _id: string; name: string; email: string; role: "user" | "admin";
  emailVerified: boolean; isBanned: boolean; createdAt: string;
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<U[]>([]);
  const [q, setQ] = useState("");

  const load = () => {
    fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`).then((r) => r.json()).then((j) => {
      if (j.ok) setItems(j.data.items);
    });
  };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

  const update = async (id: string, patch: Partial<{ isBanned: boolean; role: "user" | "admin" }>) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }),
    });
    const j = await res.json();
    if (j.ok) { toast.success("Updated"); load(); } else toast.error(j.error?.message);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Users</h1>
      <div className="mt-6 max-w-sm"><Input placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.currentTarget.value)} /></div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs uppercase text-ink-500 dark:bg-ink-900">
            <tr><th className="p-3 text-left">User</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-ink-200 bg-white dark:divide-ink-800 dark:bg-ink-950">
            {items.map((u) => (
              <tr key={u._id}>
                <td className="p-3"><div className="font-medium">{u.name}</div><div className="text-xs text-ink-500">{u.email}</div></td>
                <td className="p-3"><Badge tone={u.role === "admin" ? "warning" : "neutral"}>{u.role}</Badge></td>
                <td className="p-3 space-x-1">
                  {u.emailVerified ? <Badge tone="success">verified</Badge> : <Badge tone="warning">unverified</Badge>}
                  {u.isBanned ? <Badge tone="danger">banned</Badge> : null}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    {u.role !== "admin" ? <Button size="sm" variant="outline" onClick={() => update(u._id, { role: "admin" })}>Make admin</Button> :
                      <Button size="sm" variant="outline" onClick={() => update(u._id, { role: "user" })}>Demote</Button>}
                    {!u.isBanned ?
                      <Button size="sm" variant="danger" onClick={() => update(u._id, { isBanned: true })}>Ban</Button> :
                      <Button size="sm" variant="outline" onClick={() => update(u._id, { isBanned: false })}>Unban</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
