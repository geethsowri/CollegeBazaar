"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Verification failed");
      toast.success("Email verified");
      router.push("/profile?welcome=1");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Verification failed");
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "verify_email" }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      toast.success("New code sent");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to resend");
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-2 text-sm text-ink-500">We sent a 6-digit code to <span className="font-medium text-ink-900 dark:text-white">{email}</span></p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Verification code"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.currentTarget.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="text-center tracking-[12px] text-lg"
        />
        <Button size="lg" loading={loading}>Verify</Button>
        <button type="button" onClick={resend} className="text-sm text-ink-500 hover:underline">Resend code</button>
      </form>
    </div>
  );
}
