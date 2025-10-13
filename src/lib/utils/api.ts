import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/session";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: { message, code } }, { status });
}

export function handle(err: unknown) {
  if (err instanceof AuthError) return fail(err.message, err.status);
  if (err instanceof ZodError) {
    return fail("validation_failed", 422, err.issues.map((i) => i.message).join("; "));
  }
  console.error("[api]", err);
  return fail("internal_error", 500);
}
