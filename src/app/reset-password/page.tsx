"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      toast.success("Password reset");
      router.push("/login");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Reset password</h1>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <Input label="6-digit code" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.currentTarget.value.replace(/\D/g, ""))} />
        <Input label="New password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
        <Button size="lg" loading={loading}>Reset password</Button>
      </form>
    </div>
  );
}
