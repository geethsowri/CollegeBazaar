/**
 * Pagination helpers for cursor-based and offset-based queries.
 */

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Slice a fetched array (limit+1 items) into a cursor page.
 * Expects items to have a string _id field.
 */
export function toCursorPage<T extends { _id: unknown }>(
  raw: T[],
  limit: number
): CursorPage<T> {
  const hasMore = raw.length > limit;
  const items = hasMore ? raw.slice(0, -1) : raw;
  const nextCursor = hasMore ? String(items[items.length - 1]._id) : null;
  return { items, nextCursor, hasMore };
}

/** Build a MongoDB sort object from a sort string. */
export type SortOption = "new" | "price_asc" | "price_desc";

export function buildSort(sort: SortOption) {
  switch (sort) {
    case "price_asc":
      return { sellingPrice: 1 as const };
    case "price_desc":
      return { sellingPrice: -1 as const };
    default:
      return { createdAt: -1 as const };
  }
}
