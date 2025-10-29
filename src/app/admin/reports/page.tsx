"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils/format";

interface Report {
  _id: string; reason: string; details: string; status: string; createdAt: string;
  reporter: { name: string; email: string };
  listing: { _id: string; title: string; images: string[]; seller?: { name: string; email: string } };
}

export default function AdminReportsPage() {
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/reports").then((r) => r.json()).then((j) => {
      if (j.ok) setItems(j.data.items);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const resolve = async (id: string, status: "resolved" | "dismissed") => {
    const res = await fetch("/api/admin/reports", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }),
    });
    const j = await res.json();
    if (j.ok) { toast.success("Updated"); load(); } else toast.error(j.error?.message);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Reports</h1>
      <div className="mt-6 flex flex-col gap-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) :
          items.length === 0 ? <p className="text-sm text-ink-500">No reports.</p> :
            items.map((r) => (
              <div key={r._id} className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><Badge tone="warning">{r.reason}</Badge><Badge>{r.status}</Badge><span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span></div>
                    <Link href={`/product/${r.listing?._id}`} className="mt-2 inline-block font-medium hover:underline">{r.listing?.title}</Link>
                    <div className="text-xs text-ink-500">Seller: {r.listing?.seller?.name} ({r.listing?.seller?.email})</div>
                    <div className="text-xs text-ink-500">Reported by: {r.reporter?.name} ({r.reporter?.email})</div>
                    {r.details ? <p className="mt-3 text-sm text-ink-700 dark:text-ink-200">{r.details}</p> : null}
                  </div>
                  {r.status === "open" ? (
                    <div className="flex flex-col gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => resolve(r._id, "dismissed")}>Dismiss</Button>
                      <Button size="sm" variant="danger" onClick={() => resolve(r._id, "resolved")}>Resolve</Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
