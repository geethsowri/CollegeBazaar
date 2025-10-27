import Link from "next/link";
import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { Order } from "@/models/Order";
import { requireSession } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Category } from "@/types";
import { Plus, Eye, IndianRupee, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  await dbConnect();

  const [listings, sold, totals] = await Promise.all([
    Listing.find({ seller: session.id, status: { $ne: "removed" } }).sort({ createdAt: -1 }).limit(20).lean(),
    Order.find({ seller: session.id, status: "paid" }).populate("listing").sort({ createdAt: -1 }).limit(10).lean(),
    Order.aggregate([
      { $match: { seller: (await import("mongoose")).default.Types.ObjectId.createFromHexString(session.id), status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  const totalEarnings = totals[0]?.total ?? 0;
  const totalSold = totals[0]?.count ?? 0;
  const totalViews = listings.reduce((a, l) => a + (l.views ?? 0), 0);
  const activeCount = listings.filter((l) => l.status === "active").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Hi, {session.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ink-500">Your seller dashboard.</p>
        </div>
        <Link href="/sell"><Button><Plus className="h-4 w-4" /> New listing</Button></Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<IndianRupee className="h-4 w-4" />} label="Earnings" value={formatINR(totalEarnings)} />
        <StatCard icon={<Package className="h-4 w-4" />} label="Items sold" value={String(totalSold)} />
        <StatCard icon={<Eye className="h-4 w-4" />} label="Total views" value={String(totalViews)} />
        <StatCard icon={<Package className="h-4 w-4" />} label="Active listings" value={String(activeCount)} />
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold">Your listings</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-ink-900">
            <tr>
              <th className="p-3 font-medium">Item</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Views</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200 bg-white dark:divide-ink-800 dark:bg-ink-950">
            {listings.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-ink-500">No listings yet. <Link href="/sell" className="font-medium text-ink-900 dark:text-white">Create one</Link></td></tr>
            ) : listings.map((l) => (
              <tr key={String(l._id)}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={l.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <Link href={`/product/${l._id}`} className="font-medium hover:underline">{l.title}</Link>
                  </div>
                </td>
                <td className="p-3 text-ink-500">{CATEGORY_LABELS[l.category as Category]}</td>
                <td className="p-3">{formatINR(l.sellingPrice)}</td>
                <td className="p-3"><Badge tone={l.status === "active" ? "success" : l.status === "sold" ? "neutral" : "warning"}>{l.status}</Badge></td>
                <td className="p-3 text-ink-500">{l.views}</td>
                <td className="p-3 text-right"><Link href={`/sell?edit=${l._id}`} className="text-sm font-medium hover:underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold">Recent sales</h2>
      {sold.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">No sales yet.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sold.map((o: any) => (
            <Card key={String(o._id)}>
              <div className="flex items-center gap-3">
                <img src={o.listing?.images?.[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{o.listing?.title}</div>
                  <div className="text-xs text-ink-500">{formatINR(o.amount)} · paid</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-ink-500">{icon}<span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
    </Card>
  );
}
