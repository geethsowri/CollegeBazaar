import { dbConnect } from "@/lib/db/mongoose";
import { Report } from "@/models/Report";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["open", "resolved", "dismissed"]),
  resolution: z.string().max(500).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const items = await Report.find({})
      .populate("reporter", "name email")
      .populate({ path: "listing", populate: { path: "seller", select: "name email" } })
      .sort({ createdAt: -1 })
      .lean();
    return ok({ items });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = patchSchema.parse(await req.json());
    await dbConnect();
    const report = await Report.findByIdAndUpdate(
      body.id,
      { status: body.status, resolution: body.resolution ?? "" },
      { new: true }
    );
    if (!report) return fail("not_found", 404);
    return ok({ report });
  } catch (e) {
    return handle(e);
  }
}
