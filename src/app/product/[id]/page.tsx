import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { formatINR, timeAgo } from "@/lib/utils/format";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/components/product/product-actions";

export const dynamic = "force-dynamic";

async function getListing(id: string) {
  try {
    await dbConnect();
    const l = await Listing.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate("seller", "name avatarUrl branch year phone ratingSum ratingCount createdAt")
      .lean();
    if (!l) return null;
    return JSON.parse(JSON.stringify(l));
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const seller = listing.seller as any;
  const rating = seller?.ratingCount > 0 ? (seller.ratingSum / seller.ratingCount).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/browse" className="text-sm text-ink-500 hover:underline">← Back to browse</Link>
      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 dark:border-ink-700 dark:bg-ink-800">
            <img src={listing.images[0]} alt={listing.title} className="aspect-square w-full object-cover" />
          </div>
          {listing.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {listing.images.slice(0, 5).map((url: string, i: number) => (
                <div key={i} className="overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
                  <img src={url} alt="" className="aspect-square w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}</Badge>
            <Badge tone="neutral">{CONDITION_LABELS[listing.condition as keyof typeof CONDITION_LABELS]}</Badge>
            {listing.status === "sold" ? <Badge tone="danger">Sold</Badge> : null}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{listing.title}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold">{formatINR(listing.sellingPrice)}</span>
            <span className="text-sm text-ink-400 line-through">{formatINR(listing.originalPrice)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-500">Posted {timeAgo(listing.createdAt)} · {listing.views} views</p>

          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ink-700 dark:text-ink-200">
            {listing.description}
          </p>

          <div className="mt-8 rounded-2xl border border-ink-200 p-4 dark:border-ink-700">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-sm font-semibold dark:bg-ink-800">
                {seller?.avatarUrl ? <img src={seller.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : seller?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium">{seller?.name}</div>
                <div className="text-xs text-ink-500">
                  {seller?.branch ? `${seller.branch} · ` : ""}{seller?.year ? `Year ${seller.year}` : ""}
                  {rating ? ` · ★ ${rating}` : ""}
                </div>
              </div>
            </div>
          </div>

          <ProductActions
            listingId={String(listing._id)}
            sellerId={String(seller?._id)}
            isSold={listing.status === "sold"}
          />
        </div>
      </div>
    </div>
  );
}
