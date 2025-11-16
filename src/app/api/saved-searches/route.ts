import { dbConnect } from "@/lib/db/mongoose";
import { SavedSearch } from "@/models/SavedSearch";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const createSchema = z.object({
  label: z.string().min(1).max(60),
  query: z.string().min(1).max(500),
});

export async function GET() {
  try {
    const session = await requireSession();
    await dbConnect();
    const searches = await SavedSearch.find({ user: session.id })
      .sort({ createdAt: -1 })
      .lean();
    return ok({ searches });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = createSchema.parse(await req.json());
    await dbConnect();
    const count = await SavedSearch.countDocuments({ user: session.id });
    if (count >= 10) return fail("saved_searches_limit_reached", 400);
    const search = await SavedSearch.create({ user: session.id, ...body });
    return ok({ search }, 201);
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return fail("id_required", 400);
    await dbConnect();
    const result = await SavedSearch.deleteOne({ _id: id, user: session.id });
    if (result.deletedCount === 0) return fail("not_found", 404);
    return ok({ message: "deleted" });
  } catch (e) {
    return handle(e);
  }
}
