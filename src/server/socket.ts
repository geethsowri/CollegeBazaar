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
});

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
  socket.on("join", ({ conversationId }: { conversationId: string }) => {
    if (conversationId) socket.join(`conv:${conversationId}`);
  });

  socket.on("message", ({ conversationId, message }: { conversationId: string; message: unknown }) => {
    if (!conversationId) return;
    socket.to(`conv:${conversationId}`).emit("message", message);
  });

  socket.on("typing", ({ conversationId, typing }: { conversationId: string; typing: boolean }) => {
    socket.to(`conv:${conversationId}`).emit("typing", { userId: socket.data.userId, typing });
  });
});

http.listen(PORT, () => {
  console.log(`[socket] listening on :${PORT}`);
});
