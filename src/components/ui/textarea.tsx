"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, className, ...rest }, ref) => (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{label}</span>
      ) : null}
      <textarea
        ref={ref}
        className={cn(
          "min-h-[120px] w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/10 dark:border-ink-700 dark:bg-ink-900 dark:text-white",
          error && "border-red-500",
          className
        )}
        {...rest}
      />
      {hint && !error ? <span className="text-xs text-ink-500">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
);
Textarea.displayName = "Textarea";
