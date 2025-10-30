import { cn } from "@/lib/utils/cn";

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200 bg-white p-6 shadow-soft dark:border-ink-700 dark:bg-ink-900",
        className
      )}
      {...rest}
    />
  );
}
