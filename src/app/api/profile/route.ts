import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { profileSchema } from "@/lib/validators/auth";
import { requireSession } from "@/lib/auth/session";
import { handle, ok } from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await requireSession();
    await dbConnect();
    const user = await User.findById(session.id).select("-passwordHash -tokenVersion").lean();
    return ok({ user });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = profileSchema.parse(await req.json());
    await dbConnect();
    const user = await User.findByIdAndUpdate(session.id, body, { new: true })
      .select("-passwordHash -tokenVersion")
      .lean();
    return ok({ user });
  } catch (e) {
    return handle(e);
  }
}
