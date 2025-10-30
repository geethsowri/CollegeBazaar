"use client";

import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: Props) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity" />
        <BaseDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink-200 bg-white p-6 shadow-soft dark:border-ink-700 dark:bg-ink-900 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 transition-all">
          <div className="flex items-start justify-between">
            <div>
              {title ? <BaseDialog.Title className="text-lg font-semibold">{title}</BaseDialog.Title> : null}
              {description ? <BaseDialog.Description className="mt-1 text-sm text-ink-500">{description}</BaseDialog.Description> : null}
            </div>
            <BaseDialog.Close className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Close">
              <X className="h-4 w-4" />
            </BaseDialog.Close>
          </div>
          <div className="mt-4">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
