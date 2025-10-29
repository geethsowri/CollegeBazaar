"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils/format";

interface Item {
  _id: string; title: string; sellingPrice: number; status: string; reportCount: number;
  images: string[]; seller?: { _id: string; name: string; email: string };
}

export default function AdminListingsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = (status: string) => {
    setLoading(true);
    fetch(`/api/admin/listings${status ? `?status=${status}` : ""}`).then((r) => r.json()).then((j) => {
      if (j.ok) setItems(j.data.items);
      setLoading(false);
    });
  };
  useEffect(() => { load(filter); }, [filter]);

  const update = async (id: string, status: string) => {
    const res = await fetch("/api/admin/listings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }),
    });
    const j = await res.json();
    if (j.ok) { toast.success("Updated"); load(filter); } else toast.error(j.error?.message);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Moderate listings</h1>
      <div className="mt-6 inline-flex flex-wrap gap-1 rounded-xl border border-ink-200 p-1 dark:border-ink-700">
        {["", "active", "flagged", "removed", "pending", "sold"].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${filter === s ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "text-ink-500 hover:text-ink-900 dark:hover:text-white"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs uppercase text-ink-500 dark:bg-ink-900">
            <tr><th className="p-3 text-left">Item</th><th className="p-3 text-left">Seller</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Reports</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-ink-200 bg-white dark:divide-ink-800 dark:bg-ink-950">
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="p-3"><Skeleton className="h-12" /></td></tr>) :
              items.map((l) => (
                <tr key={l._id}>
                  <td className="p-3"><Link href={`/product/${l._id}`} className="flex items-center gap-3 hover:underline"><img src={l.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />{l.title}</Link></td>
                  <td className="p-3 text-ink-500">{l.seller?.name ?? "—"}<div className="text-xs">{l.seller?.email}</div></td>
                  <td className="p-3">{formatINR(l.sellingPrice)}</td>
                  <td className="p-3"><Badge tone={l.status === "active" ? "success" : l.status === "flagged" ? "warning" : l.status === "removed" ? "danger" : "neutral"}>{l.status}</Badge></td>
                  <td className="p-3">{l.reportCount}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {l.status !== "active" ? <Button size="sm" variant="outline" onClick={() => update(l._id, "active")}>Approve</Button> : null}
                      {l.status !== "removed" ? <Button size="sm" variant="danger" onClick={() => update(l._id, "removed")}>Remove</Button> : null}
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
