"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CATEGORIES, CATEGORY_LABELS, CONDITIONS, CONDITION_LABELS, type Category, type Condition } from "@/types";

export default function SellPage() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("mini_drafter");
  const [condition, setCondition] = useState<Condition>("good");
  const [originalPrice, setOriginalPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [branchRelevance, setBranchRelevance] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/listings/${editId}`).then((r) => r.json()).then((j) => {
      if (!j.ok) return;
      const l = j.data.listing;
      setTitle(l.title); setDescription(l.description); setCategory(l.category);
      setCondition(l.condition); setOriginalPrice(String(l.originalPrice));
      setSellingPrice(String(l.sellingPrice)); setContactPhone(l.contactPhone ?? "");
      setBranchRelevance((l.branchRelevance ?? []).join(", ")); setImages(l.images ?? []);
    });
  }, [editId]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      setImages((prev) => [...prev, json.data.url]);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Add at least one image");
    setSaving(true);
    try {
      const body = {
        title, description, category, condition,
        originalPrice: Number(originalPrice), sellingPrice: Number(sellingPrice),
        images, contactPhone,
        branchRelevance: branchRelevance.split(",").map((s) => s.trim()).filter(Boolean),
        yearRelevance: [] as number[],
      };
      const res = await fetch(editId ? `/api/listings/${editId}` : "/api/listings", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      toast.success(editId ? "Listing updated" : "Listing posted");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{editId ? "Edit listing" : "Sell an item"}</h1>
      <p className="mt-1 text-sm text-ink-500">Only mini drafters, calculators, and lab aprons are allowed.</p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required maxLength={120} placeholder="Casio fx-991ES Plus, used 1 sem" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} required maxLength={2000} placeholder="Condition, what's included, why you're selling…" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Category" value={category} onValueChange={(v) => setCategory((v as Category) ?? "")}
            options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))} />
          <Select label="Condition" value={condition} onValueChange={(v) => setCondition((v as Condition) ?? "")}
            options={CONDITIONS.map((c) => ({ value: c, label: CONDITION_LABELS[c] }))} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Original price (₹)" type="number" min={1} required value={originalPrice} onChange={(e) => setOriginalPrice(e.currentTarget.value)} />
          <Input label="Selling price (₹)" type="number" min={1} required value={sellingPrice} onChange={(e) => setSellingPrice(e.currentTarget.value)} />
        </div>
        <Input label="Branches (comma-separated, optional)" value={branchRelevance} onChange={(e) => setBranchRelevance(e.currentTarget.value)} placeholder="CSE, ME, EE" />
        <Input label="Contact phone (optional)" value={contactPhone} onChange={(e) => setContactPhone(e.currentTarget.value)} placeholder="+91…" />

        <div>
          <div className="text-sm font-medium text-ink-700 dark:text-ink-200">Photos</div>
          <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {images.map((url, i) => (
              <div key={url} className="group relative overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
                <img src={url} alt="" className="aspect-square w-full object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {images.length < 6 ? (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink-300 text-ink-500 hover:border-ink-900 hover:text-ink-900 dark:border-ink-700 dark:hover:border-white dark:hover:text-white">
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) uploadFile(f); }} />
              </label>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-ink-500">Up to 6 images. Clear, well-lit photos sell faster.</p>
        </div>

        <Button size="lg" loading={saving}>{editId ? "Save changes" : "Post listing"}</Button>
      </form>
    </div>
  );
}
