import { requireSession } from "@/lib/auth/session";
import { uploadImage } from "@/lib/services/cloudinary";
import { fail, handle, ok } from "@/lib/utils/api";

const MAX = 8 * 1024 * 1024; // 8MB

export async function POST(req: Request) {
  try {
    await requireSession();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("file_required", 400);
    if (file.size > MAX) return fail("file_too_large", 413);
    if (!file.type.startsWith("image/")) return fail("invalid_type", 400);
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buf.toString("base64")}`;
    const { url, publicId } = await uploadImage(dataUri);
    return ok({ url, publicId });
  } catch (e) {
    return handle(e);
  }
}
