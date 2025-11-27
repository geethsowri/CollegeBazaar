"use client";

import { useState, useCallback, useRef } from "react";

export interface InfiniteScrollOptions<T> {
  /** Function that fetches a page given a cursor, returns { items, nextCursor } */
  fetcher: (cursor: string | null) => Promise<{ items: T[]; nextCursor: string | null }>;
}

export interface UseInfiniteScrollState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

export function useInfiniteScroll<T>(
  opts: InfiniteScrollOptions<T>
): UseInfiniteScrollState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    opts
      .fetcher(cursor)
      .then(({ items: newItems, nextCursor }) => {
        setItems((prev) => [...prev, ...newItems]);
        setCursor(nextCursor);
        setHasMore(nextCursor !== null);
      })
      .catch((err) => setError(err.message ?? "load_failed"))
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  }, [cursor, hasMore, opts]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
  }, []);

  return { items, loading, error, hasMore, loadMore, reset };
}
