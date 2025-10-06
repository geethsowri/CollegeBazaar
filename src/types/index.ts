export type Role = "user" | "admin";
export type Category = "mini_drafter" | "calculator" | "lab_apron";
export const CATEGORIES: Category[] = ["mini_drafter", "calculator", "lab_apron"];
export const CATEGORY_LABELS: Record<Category, string> = {
  mini_drafter: "Mini Drafter",
  calculator: "Calculator",
  lab_apron: "Lab Apron",
};

export type Condition = "like_new" | "good" | "average";
export const CONDITIONS: Condition[] = ["like_new", "good", "average"];
export const CONDITION_LABELS: Record<Condition, string> = {
  like_new: "Like New",
  good: "Good",
  average: "Average",
};

export type ListingStatus = "active" | "sold" | "removed" | "flagged" | "pending";
export type OrderStatus =
  | "created"
  | "paid"
  | "completed"
  | "cancelled"
  | "refunded";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  v?: number; // token version for refresh invalidation
}
