"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard, type ListingCardData } from "@/components/product/listing-card";

interface Item {
  _id: string;
  listing: ListingCardData;
}

export default function WishlistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist").then((r) => r.json()).then((j) => {
      if (j.ok) setItems(j.data.items);
      setLoading(false);
    });
  }, []);

  const remove = async (listingId: string) => {
    const res = await fetch(`/api/wishlist?listingId=${listingId}`, { method: "DELETE" });
    const j = await res.json();
    if (j.ok) {
      setItems((prev) => prev.filter((i) => i.listing._id !== listingId));
      toast.success("Removed");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Wishlist</h1>
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500">No saved items yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => <ListingCard key={i._id} listing={i.listing} onWishlist={() => remove(i.listing._id)} wishlisted />)}
        </div>
      )}
    </div>
  );
}
