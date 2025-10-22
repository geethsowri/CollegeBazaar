import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { Report } from "@/models/Report";
import { reportSchema } from "@/lib/validators/listing";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    const body = reportSchema.parse({ ...(await req.json()), listingId: id });
    await dbConnect();
    const listing = await Listing.findById(id);
    if (!listing) return fail("not_found", 404);
    await Report.create({
      reporter: session.id,
      listing: id,
      reason: body.reason,
      details: body.details,
    });
    listing.reportCount += 1;
    if (listing.reportCount >= 3) listing.status = "flagged";
    await listing.save();
    return ok({ reported: true });
  } catch (e) {
    return handle(e);
  }
}
