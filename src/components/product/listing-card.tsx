"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { formatINR } from "@/lib/utils/format";
import { CATEGORY_LABELS, CONDITION_LABELS, type Category, type Condition } from "@/types";
import { Badge } from "@/components/ui/badge";

export interface ListingCardData {
  _id: string;
  title: string;
  images: string[];
  sellingPrice: number;
  originalPrice: number;
  category: Category;
  condition: Condition;
  seller?: { _id: string; name: string; avatarUrl?: string };
}

export function ListingCard({ listing, onWishlist, wishlisted }: {
  listing: ListingCardData;
  onWishlist?: (id: string) => void;
  wishlisted?: boolean;
}) {
  const discount = Math.max(
    0,
    Math.round(((listing.originalPrice - listing.sellingPrice) / listing.originalPrice) * 100)
  );

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft transition-shadow hover:shadow-md dark:border-ink-700 dark:bg-ink-900"
    >
      <Link href={`/product/${listing._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full" />
          )}
          {discount > 0 ? (
            <div className="absolute left-3 top-3">
              <Badge tone="success">{discount}% off</Badge>
            </div>
          ) : null}
          {onWishlist ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                onWishlist(listing._id);
              }}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-700 shadow-soft transition-colors hover:bg-white dark:bg-ink-900/90 dark:text-white"
              aria-label="Wishlist"
            >
              <Heart className={wishlisted ? "h-4 w-4 fill-red-500 text-red-500" : "h-4 w-4"} />
            </button>
          ) : null}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span>{CATEGORY_LABELS[listing.category]}</span>
            <span aria-hidden>·</span>
            <span>{CONDITION_LABELS[listing.condition]}</span>
          </div>
          <h3 className="mt-1.5 line-clamp-1 font-medium text-ink-900 dark:text-white">{listing.title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold">{formatINR(listing.sellingPrice)}</span>
            <span className="text-xs text-ink-400 line-through">{formatINR(listing.originalPrice)}</span>
          </div>
          {listing.seller ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-ink-100 text-[10px] font-semibold dark:bg-ink-800">
                {listing.seller.avatarUrl ? (
                  <img src={listing.seller.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  listing.seller.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="truncate">{listing.seller.name}</span>
            </div>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
