import { getSession } from "@/lib/auth/session";
import { ok } from "@/lib/utils/api";

export async function GET() {
  const user = await getSession();
  return ok({ user });
}
