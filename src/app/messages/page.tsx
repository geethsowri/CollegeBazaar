"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils/format";

interface Convo {
  _id: string;
  lastMessage: string;
  lastMessageAt: string;
  participants: { _id: string; name: string; avatarUrl?: string }[];
  listing: { _id: string; title: string; images: string[]; sellingPrice: number; status: string };
}

export default function MessagesPage() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/conversations").then((r) => r.json()),
    ]).then(([m, c]) => {
      setMe(m?.data?.user?.id ?? null);
      if (c.ok) setConvos(c.data.items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Messages</h1>
      <div className="mt-6 flex flex-col gap-2">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />) :
          convos.length === 0 ? <p className="text-sm text-ink-500">No conversations yet. Start one from any product page.</p> :
            convos.map((c) => {
              const other = c.participants.find((p) => p._id !== me);
              return (
                <Link key={c._id} href={`/messages/${c._id}`}
                  className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:hover:bg-ink-800">
                  <img src={c.listing?.images?.[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="truncate font-medium">{other?.name ?? "Conversation"}</div>
                      <div className="text-xs text-ink-500">{timeAgo(c.lastMessageAt)}</div>
                    </div>
                    <div className="truncate text-xs text-ink-500">{c.listing?.title}</div>
                    <div className="truncate text-sm text-ink-700 dark:text-ink-200">{c.lastMessage || "—"}</div>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
