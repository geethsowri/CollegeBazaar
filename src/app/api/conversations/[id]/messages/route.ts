import { dbConnect } from "@/lib/db/mongoose";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({ body: z.string().min(1).max(2000) });

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    await dbConnect();
    const convo = await Conversation.findById(id);
    if (!convo) return fail("not_found", 404);
    if (!convo.participants.map(String).includes(session.id)) return fail("forbidden", 403);

    const msgs = await Message.find({ conversation: id })
      .sort({ createdAt: 1 })
      .lean();
    await Message.updateMany(
      { conversation: id, sender: { $ne: session.id }, readBy: { $ne: session.id } },
      { $addToSet: { readBy: session.id } }
    );
    return ok({ messages: msgs });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    const { body } = schema.parse(await req.json());
    await dbConnect();
    const convo = await Conversation.findById(id);
    if (!convo) return fail("not_found", 404);
    if (!convo.participants.map(String).includes(session.id)) return fail("forbidden", 403);

    const msg = await Message.create({
      conversation: id,
      sender: session.id,
      body,
      readBy: [session.id],
    });
    convo.lastMessage = body;
    convo.lastMessageAt = new Date();
    await convo.save();
    return ok({ message: msg });
  } catch (e) {
    return handle(e);
  }
}
