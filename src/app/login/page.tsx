"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.ok) {
        if (json.error?.message === "email_not_verified") {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
          return;
        }
        throw new Error(json.error?.message ?? "Login failed");
      }
      toast.success("Welcome back");
      router.push(next);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-500">Log in with your college email.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <Input label="College email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="you@college.edu" />
        <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.currentTarget.value)} placeholder="••••••••" />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-ink-500 hover:underline">Forgot password?</Link>
        </div>
        <Button size="lg" loading={loading}>Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        New here? <Link href="/signup" className="font-medium text-ink-900 dark:text-white">Create an account</Link>
      </p>
    </div>
  );
}
