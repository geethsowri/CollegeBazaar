import Link from "next/link";
import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Report } from "@/models/Report";
import { requireAdmin } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  await dbConnect();
  const [users, listings, orders, reports, flagged] = await Promise.all([
    User.countDocuments({}),
    Listing.countDocuments({ status: "active" }),
    Order.countDocuments({ status: "paid" }),
    Report.countDocuments({ status: "open" }),
    Listing.countDocuments({ status: "flagged" }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-ink-500">Marketplace health at a glance.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Users" value={users} />
        <Stat label="Active listings" value={listings} />
        <Stat label="Paid orders" value={orders} />
        <Stat label="Open reports" value={reports} tone="warn" />
        <Stat label="Flagged listings" value={flagged} tone="warn" />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/listings"><Card className="hover:bg-ink-50 dark:hover:bg-ink-800"><h3 className="font-semibold">Moderate listings</h3><p className="mt-1 text-sm text-ink-500">Approve, flag, or remove posts.</p></Card></Link>
        <Link href="/admin/reports"><Card className="hover:bg-ink-50 dark:hover:bg-ink-800"><h3 className="font-semibold">Reports</h3><p className="mt-1 text-sm text-ink-500">Triage user reports.</p></Card></Link>
        <Link href="/admin/users"><Card className="hover:bg-ink-50 dark:hover:bg-ink-800"><h3 className="font-semibold">Users</h3><p className="mt-1 text-sm text-ink-500">Ban or promote accounts.</p></Card></Link>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      <div className={`mt-2 font-display text-3xl font-semibold ${tone === "warn" && value > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>{value}</div>
    </Card>
  );
}
