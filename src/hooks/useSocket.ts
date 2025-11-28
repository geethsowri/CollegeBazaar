"use client";

import { useEffect, useRef, useState } from "react";

export interface UseSocketOptions {
  url: string;
  enabled?: boolean;
}

/**
 * Minimal hook that manages a WebSocket-like connection via Socket.io-client.
 * Dynamically imports socket.io-client to avoid SSR issues.
 */
export function useSocket(url: string, enabled = true) {
  const socketRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    import("socket.io-client").then(({ io }) => {
      if (!mounted) return;
      const socket = io(url, { withCredentials: true, transports: ["websocket"] });
      socketRef.current = socket;
      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
    });

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [url, enabled]);

  function emit(event: string, data?: unknown) {
    socketRef.current?.emit(event, data);
  }

  function on(event: string, handler: (...args: any[]) => void) {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }

  return { connected, emit, on, socket: socketRef };
}
