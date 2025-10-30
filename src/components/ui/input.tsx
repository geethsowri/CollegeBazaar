"use client";

import * as React from "react";
import { Field } from "@base-ui-components/react/field";
import { cn } from "@/lib/utils/cn";

interface Props extends React.ComponentProps<typeof Field.Control> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, className, ...rest }, ref) => (
    <Field.Root className="flex flex-col gap-1.5">
      {label ? (
        <Field.Label className="text-sm font-medium text-ink-700 dark:text-ink-200">
          {label}
        </Field.Label>
      ) : null}
      <Field.Control
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/10 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:focus:border-white dark:focus:ring-white/10",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...rest}
      />
      {hint && !error ? (
        <Field.Description className="text-xs text-ink-500">{hint}</Field.Description>
      ) : null}
      {error ? <Field.Error className="text-xs text-red-600">{error}</Field.Error> : null}
    </Field.Root>
  )
);
Input.displayName = "Input";
