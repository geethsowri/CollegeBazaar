import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { listingCreateSchema, listingFiltersSchema } from "@/lib/validators/listing";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { toCursorPage, buildSort } from "@/lib/utils/pagination";
import { rateLimit, rateLimitKey } from "@/lib/utils/rateLimit";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const filters = listingFiltersSchema.parse(params);

    await dbConnect();
    const query: Record<string, unknown> = { status: "active" };
    if (filters.q) query.$text = { $search: filters.q };
    if (filters.category) query.category = filters.category;
    if (filters.condition) query.condition = filters.condition;
    if (filters.branch) query.branchRelevance = filters.branch;
    if (filters.year) query.yearRelevance = filters.year;
    if (filters.minPrice || filters.maxPrice) {
      query.sellingPrice = {
        ...(filters.minPrice ? { $gte: filters.minPrice } : {}),
        ...(filters.maxPrice ? { $lte: filters.maxPrice } : {}),
      };
    }
    if (filters.cursor) query._id = { $lt: filters.cursor };

    const items = await Listing.find(query)
      .sort(buildSort(filters.sort))
      .limit(filters.limit + 1)
      .populate("seller", "name avatarUrl branch year ratingSum ratingCount")
      .lean();

    return ok(toCursorPage(items, filters.limit));
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    // Rate-limit: max 10 listings per hour per IP
    const rl = rateLimit(rateLimitKey(req, "create_listing"), { limit: 10, windowSec: 3600 });
    if (!rl.ok) return fail("rate_limit_exceeded", 429);

    const session = await requireSession();
    if (!session.emailVerified) return fail("email_not_verified", 403);
    const body = listingCreateSchema.parse(await req.json());
    if (body.sellingPrice > body.originalPrice)
      return fail("selling_price_above_original", 400);
    await dbConnect();
    const listing = await Listing.create({ ...body, seller: session.id });
    return ok({ listing }, 201);
  } catch (e) {
    return handle(e);
  }
}
