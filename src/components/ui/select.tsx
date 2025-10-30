"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui-components/react/select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
}

export function Select({ label, placeholder, options, value, onValueChange, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{label}</span> : null}
      <BaseSelect.Root value={value} onValueChange={onValueChange}>
        <BaseSelect.Trigger className="flex h-10 w-full items-center justify-between rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-ink-900/10 dark:border-ink-700 dark:bg-ink-900 dark:text-white">
          <BaseSelect.Value placeholder={placeholder ?? "Select…"} />
          <BaseSelect.Icon>
            <ChevronDown className="h-4 w-4 text-ink-500" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner sideOffset={6} className="z-50">
            <BaseSelect.Popup className="rounded-xl border border-ink-200 bg-white p-1 shadow-soft dark:border-ink-700 dark:bg-ink-900 min-w-[180px]">
              {options.map((o) => (
                <BaseSelect.Item
                  key={o.value}
                  value={o.value}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-900 hover:bg-ink-100 data-[highlighted]:bg-ink-100 dark:text-white dark:hover:bg-ink-800 dark:data-[highlighted]:bg-ink-800"
                >
                  <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
}
