import { clearAuthCookies } from "@/lib/auth/cookies";
import { ok } from "@/lib/utils/api";

export async function POST() {
  await clearAuthCookies();
  return ok({ loggedOut: true });
}
