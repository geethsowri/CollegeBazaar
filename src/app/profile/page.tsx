"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  name: string; email: string; branch: string; year: number | null;
  phone: string; avatarUrl: string; residence: "hosteller" | "day_scholar" | "";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((j) => { if (j.ok) setProfile(j.data.user); });
  }, []);

  const uploadAvatar = async (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (j.ok) setProfile((p) => p ? { ...p, avatarUrl: j.data.url } : p);
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name, branch: profile.branch, year: profile.year,
          phone: profile.phone, avatarUrl: profile.avatarUrl, residence: profile.residence,
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error?.message);
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setSaving(false); }
  };

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-ink-500">{profile.email}</p>

      <div className="mt-8 flex items-center gap-5">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-ink-100 text-2xl font-semibold dark:bg-ink-800">
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-20 w-20 object-cover" /> : profile.name?.charAt(0).toUpperCase()}
        </div>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) uploadAvatar(f); }} />
          <span className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800">Upload photo</span>
        </label>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Input label="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.currentTarget.value })} />
        <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.currentTarget.value })} />
        <Input label="Branch" value={profile.branch} onChange={(e) => setProfile({ ...profile, branch: e.currentTarget.value })} placeholder="CSE / ME / EE…" />
        <Input label="Year" type="number" min={1} max={6} value={profile.year ?? ""} onChange={(e) => setProfile({ ...profile, year: e.currentTarget.value ? Number(e.currentTarget.value) : null })} />
        <Select label="Residence" value={profile.residence || ""} onValueChange={(v) => setProfile({ ...profile, residence: (v as Profile["residence"]) ?? "" })}
          options={[
            { value: "", label: "Prefer not to say" },
            { value: "hosteller", label: "Hosteller" },
            { value: "day_scholar", label: "Day scholar" },
          ]} />
      </div>

      <div className="mt-8">
        <Button size="lg" loading={saving} onClick={save}>Save changes</Button>
      </div>
    </div>
  );
}
