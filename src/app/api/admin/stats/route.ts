import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Listing } from "@/models/Listing";
import { Order } from "@/models/Order";
import { Report } from "@/models/Report";
import { requireAdmin } from "@/lib/auth/session";
import { handle, ok } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const [
      totalUsers,
      verifiedUsers,
      bannedUsers,
      totalListings,
      activeListings,
      soldListings,
      flaggedListings,
      totalOrders,
      paidOrders,
      openReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ emailVerified: true }),
      User.countDocuments({ isBanned: true }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "active" }),
      Listing.countDocuments({ status: "sold" }),
      Listing.countDocuments({ status: "flagged" }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["paid", "completed"] } }),
      Report.countDocuments({ status: "open" }),
    ]);

    // Revenue (sum of paid+completed orders)
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total ?? 0;

    return ok({
      users: { total: totalUsers, verified: verifiedUsers, banned: bannedUsers },
      listings: { total: totalListings, active: activeListings, sold: soldListings, flagged: flaggedListings },
      orders: { total: totalOrders, paid: paidOrders, revenue: totalRevenue },
      reports: { open: openReports },
    });
  } catch (e) {
    return handle(e);
  }
}
