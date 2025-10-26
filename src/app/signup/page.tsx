"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Signup failed");
      toast.success("Check your email for a 6-digit code");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      const m = e?.message;
      if (m === "not_a_college_email") toast.error("Use your college email");
      else if (m === "email_taken") toast.error("Email already registered");
      else toast.error(m ?? "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-2 text-sm text-ink-500">College email required. Takes under a minute.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <Input label="Full name" required value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Anjali Sharma" />
        <Input label="College email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="you@college.edu" />
        <Input label="Password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.currentTarget.value)} placeholder="Min 8 characters" />
        <Button size="lg" loading={loading}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Have an account? <Link href="/login" className="font-medium text-ink-900 dark:text-white">Log in</Link>
      </p>
    </div>
  );
}
