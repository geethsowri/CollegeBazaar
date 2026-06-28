/**
 * Pagination helpers for cursor-based and offset-based queries.
 */

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type SortOption = "new" | "price_asc" | "price_desc";

/** The field used as the primary sort key for each sort option. */
const SORT_FIELD: Record<SortOption, string> = {
  new: "createdAt",
  price_asc: "sellingPrice",
  price_desc: "sellingPrice",
};

/**
 * Encode a cursor from the last item in a page.
 * Format: base64("field:value:id") so the route can apply the right comparison.
 */
export function encodeCursor(
  item: Record<string, unknown>,
  sort: SortOption
): string {
  const field = SORT_FIELD[sort];
  const value = item[field];
  const id = String(item._id);
  // Serialize value — dates become ISO strings, numbers stay as-is
  const serialized =
    value instanceof Date ? value.toISOString() : String(value);
  return Buffer.from(`${field}:${serialized}:${id}`).toString("base64url");
}

/**
 * Decode a cursor produced by encodeCursor.
 * Returns { field, value, id } or null if the cursor is invalid.
 */
export function decodeCursor(
  cursor: string
): { field: string; value: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const firstColon = decoded.indexOf(":");
    const lastColon = decoded.lastIndexOf(":");
    if (firstColon === -1 || firstColon === lastColon) return null;
    const field = decoded.slice(0, firstColon);
    const id = decoded.slice(lastColon + 1);
    const value = decoded.slice(firstColon + 1, lastColon);
    return { field, value, id };
  } catch {
    return null;
  }
}

/**
 * Slice a fetched array (limit+1 items) into a cursor page.
 * Encodes the cursor relative to the active sort option.
 */
export function toCursorPage<T extends Record<string, unknown>>(
  raw: T[],
  limit: number,
  sort: SortOption
): CursorPage<T> {
  const hasMore = raw.length > limit;
  const items = hasMore ? raw.slice(0, -1) : raw;
  const nextCursor =
    hasMore ? encodeCursor(items[items.length - 1], sort) : null;
  return { items, nextCursor, hasMore };
}

/** Build a MongoDB sort object from a sort string. */
export function buildSort(sort: SortOption): Record<string, 1 | -1> {
  switch (sort) {
    case "price_asc":
      return { sellingPrice: 1, _id: 1 };
    case "price_desc":
      return { sellingPrice: -1, _id: -1 };
    default:
      // "new" — sorted by createdAt desc; _id is monotonically correlated so
      // it works as a stable tiebreaker without an extra index.
      return { createdAt: -1, _id: -1 };
  }
}
