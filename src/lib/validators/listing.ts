import { z } from "zod";

export const CATEGORY = z.enum(["mini_drafter", "calculator", "lab_apron"]);
export const CONDITION = z.enum(["like_new", "good", "average"]);

export const listingCreateSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(10).max(2000),
  category: CATEGORY,
  condition: CONDITION,
  images: z.array(z.string().url()).min(1).max(6),
  originalPrice: z.number().int().min(1).max(100000),
  sellingPrice: z.number().int().min(1).max(100000),
  branchRelevance: z.array(z.string()).max(15).default([]),
  yearRelevance: z.array(z.number().int().min(1).max(6)).max(6).default([]),
  contactPhone: z.string().max(20).default(""),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export const listingFiltersSchema = z.object({
  q: z.string().optional(),
  category: CATEGORY.optional(),
  condition: CONDITION.optional(),
  branch: z.string().optional(),
  year: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().int().optional(),
  maxPrice: z.coerce.number().int().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(48).default(24),
  sort: z.enum(["new", "price_asc", "price_desc"]).default("new"),
});

export const reportSchema = z.object({
  listingId: z.string(),
  reason: z.enum(["spam", "fake", "inappropriate", "wrong_category", "other"]),
  details: z.string().max(1000).default(""),
});
