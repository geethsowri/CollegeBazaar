import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { jwtVerify } from "jose";

const PORT = Number(process.env.SOCKET_PORT ?? 4000);
const ACCESS = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const http = createServer();
const io = new Server(http, {
  cors: { origin: ORIGIN, credentials: true },
  pingTimeout: 30000,
  pingInterval: 10000,
});

/** Track online users: userId → Set of socket IDs */
const onlineUsers = new Map<string, Set<string>>();

function addOnline(userId: string, socketId: string) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId)!.add(socketId);
}

function removeOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) onlineUsers.delete(userId);
}

io.use(async (socket, next) => {
  try {
    const cookie = socket.handshake.headers.cookie ?? "";
    const m = /(?:^|;\s*)cb_access=([^;]+)/.exec(cookie);
    if (!m) return next(new Error("unauthenticated"));
    const { payload } = await jwtVerify(decodeURIComponent(m[1]), ACCESS);
    (socket.data as any).userId = payload.sub;
    next();
  } catch {
    next(new Error("unauthenticated"));
  }
});

io.on("connection", (socket) => {
  const userId = String((socket.data as any).userId);
  addOnline(userId, socket.id);

  // Broadcast online status to all clients
  io.emit("presence", { userId, online: true });

  socket.on("join", ({ conversationId }: { conversationId: string }) => {
    if (conversationId) socket.join(`conv:${conversationId}`);
  });

  socket.on("leave", ({ conversationId }: { conversationId: string }) => {
    if (conversationId) socket.leave(`conv:${conversationId}`);
  });

  socket.on("message", ({ conversationId, message }: { conversationId: string; message: unknown }) => {
    if (!conversationId) return;
    socket.to(`conv:${conversationId}`).emit("message", message);
  });

  socket.on("typing", ({ conversationId, typing }: { conversationId: string; typing: boolean }) => {
    socket.to(`conv:${conversationId}`).emit("typing", { userId, typing });
  });

  /** Allow a client to query who is online */
  socket.on("online_users", (cb: (ids: string[]) => void) => {
    if (typeof cb === "function") cb(Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    removeOnline(userId, socket.id);
    if (!onlineUsers.has(userId)) {
      io.emit("presence", { userId, online: false });
    }
  });
});

http.listen(PORT, () => {
  console.log(`[socket] listening on :${PORT}`);
});
