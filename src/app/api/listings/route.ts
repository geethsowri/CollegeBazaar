import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { listingCreateSchema, listingFiltersSchema } from "@/lib/validators/listing";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";

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

    const sort =
      filters.sort === "price_asc"
        ? { sellingPrice: 1 as const }
        : filters.sort === "price_desc"
          ? { sellingPrice: -1 as const }
          : { createdAt: -1 as const };

    const items = await Listing.find(query)
      .sort(sort)
      .limit(filters.limit + 1)
      .populate("seller", "name avatarUrl branch year ratingSum ratingCount")
      .lean();

    const hasMore = items.length > filters.limit;
    const page = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? String(page[page.length - 1]._id) : null;
    return ok({ items: page, nextCursor });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
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
