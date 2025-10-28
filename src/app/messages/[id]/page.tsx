"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils/format";

interface Message { _id: string; sender: string; body: string; createdAt: string }

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((j) => setMe(j?.data?.user?.id ?? null));
    fetch(`/api/conversations/${id}/messages`).then((r) => r.json()).then((j) => {
      if (j.ok) setMessages(j.data.messages);
    });
  }, [id]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
    const s = io(url, { withCredentials: true, transports: ["websocket"] });
    socketRef.current = s;
    s.emit("join", { conversationId: id });
    s.on("message", (msg: Message) => setMessages((prev) => [...prev, msg]));
    return () => { s.disconnect(); };
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    const text = body;
    setBody("");
    // optimistic
    const optimistic: Message = { _id: `tmp-${Date.now()}`, sender: me ?? "", body: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error?.message);
      socketRef.current?.emit("message", { conversationId: id, message: j.data.message });
      setMessages((prev) => prev.map((m) => m._id === optimistic._id ? j.data.message : m));
    } catch (e: any) {
      toast.error(e?.message ?? "Send failed");
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4 py-6 sm:px-6">
      <button onClick={() => router.push("/messages")} className="self-start text-sm text-ink-500 hover:underline">← All messages</button>

      <div className="mt-4 flex-1 overflow-y-auto scrollbar-thin rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex flex-col gap-3">
          {messages.map((m) => {
            const mine = m.sender === me;
            return (
              <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white"}`}>
                  <div>{m.body}</div>
                  <div className={`mt-1 text-[10px] ${mine ? "text-ink-300 dark:text-ink-500" : "text-ink-500"}`}>{timeAgo(m.createdAt)}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={body} onChange={(e) => setBody(e.currentTarget.value)} placeholder="Type a message…"
          className="h-12 flex-1 rounded-xl border border-ink-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/10 dark:border-ink-700 dark:bg-ink-900" />
        <Button size="lg" type="submit" disabled={!body.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
