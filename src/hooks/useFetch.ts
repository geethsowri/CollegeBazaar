/**
 * Custom hook for fetching data with SWR-like semantics using React's built-in hooks.
 * Provides loading, error, data, and a manual refetch function.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string | null): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(() => {
    if (!url) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    fetch(url, { signal: ctrl.signal, credentials: "include" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "request_failed");
        setData(json.data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message ?? "unknown_error");
      })
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
