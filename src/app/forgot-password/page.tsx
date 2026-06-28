"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      toast.success("If that email exists, a code was sent");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Forgot password</h1>
      <p className="mt-2 text-sm text-ink-500">We&apos;ll send a 6-digit code to reset it.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <Input label="College email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <Button size="lg" loading={loading}>Send code</Button>
      </form>
    </div>
  );
}
