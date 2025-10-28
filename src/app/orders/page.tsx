"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, timeAgo } from "@/lib/utils/format";

interface Order {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  listing: { _id: string; title: string; images: string[] };
  seller: { name: string; email: string };
  buyer: { name: string; email: string };
}

export default function OrdersPage() {
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders?role=${role}`).then((r) => r.json()).then((j) => {
      if (j.ok) setOrders(j.data.orders);
      setLoading(false);
    });
  }, [role]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Orders</h1>
      <div className="mt-6 inline-flex rounded-xl border border-ink-200 p-1 dark:border-ink-700">
        {(["buyer", "seller"] as const).map((r) => (
          <button key={r}
            onClick={() => setRole(r)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${role === r ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "text-ink-500 hover:text-ink-900 dark:hover:text-white"}`}>
            {r === "buyer" ? "Purchases" : "Sales"}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
          orders.length === 0 ? <p className="text-sm text-ink-500">No orders yet.</p> :
            orders.map((o) => (
              <div key={o._id} className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
                <img src={o.listing?.images?.[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <Link href={`/product/${o.listing?._id}`} className="font-medium hover:underline">{o.listing?.title}</Link>
                  <div className="text-xs text-ink-500">
                    {role === "buyer" ? `Seller: ${o.seller?.name}` : `Buyer: ${o.buyer?.name}`} · {timeAgo(o.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatINR(o.amount)}</div>
                  <Badge tone={o.status === "paid" || o.status === "completed" ? "success" : o.status === "cancelled" ? "danger" : "neutral"}>{o.status}</Badge>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
