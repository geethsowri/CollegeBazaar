"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard, type ListingCardData } from "@/components/product/listing-card";
import { CATEGORIES, CATEGORY_LABELS, CONDITIONS, CONDITION_LABELS } from "@/types";
import { toast } from "sonner";

export default function BrowsePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<string>(params.get("category") ?? "");
  const [condition, setCondition] = useState<string>(params.get("condition") ?? "");
  const [sort, setSort] = useState<string>(params.get("sort") ?? "new");
  const sentinel = useRef<HTMLDivElement | null>(null);

  const buildQS = useCallback((extra?: Record<string, string | null>) => {
    const sp = new URLSearchParams();
    const apply = (k: string, v: string | null | undefined) => v && sp.set(k, v);
    apply("q", q);
    apply("category", category);
    apply("condition", condition);
    apply("sort", sort);
    if (extra) Object.entries(extra).forEach(([k, v]) => { if (v) sp.set(k, v); else sp.delete(k); });
    return sp.toString();
  }, [q, category, condition, sort]);

  const fetchPage = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (category) sp.set("category", category);
      if (condition) sp.set("condition", condition);
      if (sort) sp.set("sort", sort);
      if (!reset && cursor) sp.set("cursor", cursor);
      const res = await fetch(`/api/listings?${sp.toString()}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      setItems((prev) => (reset ? json.data.items : [...prev, ...json.data.items]));
      setCursor(json.data.nextCursor);
      setHasMore(Boolean(json.data.nextCursor));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q, category, condition, sort, cursor]);

  useEffect(() => {
    setItems([]); setCursor(null); setHasMore(true);
    const t = setTimeout(() => {
      router.replace(`/browse?${buildQS()}`);
      fetchPage(true);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, condition, sort]);

  useEffect(() => {
    if (!sentinel.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchPage(false);
    }, { rootMargin: "300px" });
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [fetchPage, hasMore, loading]);

  const categoryOpts = useMemo(
    () => [{ value: "", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))],
    []
  );
  const conditionOpts = useMemo(
    () => [{ value: "", label: "Any condition" }, ...CONDITIONS.map((c) => ({ value: c, label: CONDITION_LABELS[c] }))],
    []
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Browse listings</h1>
          <p className="mt-1 text-sm text-ink-500">{loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input value={q} onChange={(e) => setQ(e.currentTarget.value)} placeholder="Search drafters, calculators…" className="pl-9" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select label="Category" options={categoryOpts} value={category} onValueChange={(v) => setCategory(v ?? "")} />
        <Select label="Condition" options={conditionOpts} value={condition} onValueChange={(v) => setCondition(v ?? "")} />
        <Select label="Sort by" options={[
          { value: "new", label: "Newest" },
          { value: "price_asc", label: "Price: low to high" },
          { value: "price_desc", label: "Price: high to low" },
        ]} value={sort} onValueChange={(v) => setSort((v as any) ?? "new")} />
        <Button variant="outline" className="mt-6 self-end" onClick={() => { setQ(""); setCategory(""); setCondition(""); setSort("new"); }}>
          <SlidersHorizontal className="h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((l) => <ListingCard key={l._id} listing={l} />)}
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={`s${i}`} className="h-80" />)
          : null}
      </div>
      {!hasMore && !loading && items.length > 0 ? (
        <p className="mt-10 text-center text-sm text-ink-500">You&apos;re all caught up.</p>
      ) : null}
      <div ref={sentinel} className="h-1" />
    </div>
  );
}
