import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI missing");

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalAny = globalThis as unknown as { _mongo?: Cached };
const cached: Cached = globalAny._mongo ?? { conn: null, promise: null };
globalAny._mongo = cached;

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 20,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
