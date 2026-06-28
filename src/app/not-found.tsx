import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="font-display text-7xl font-semibold tracking-tight">404</div>
      <p className="mt-3 text-ink-500">We couldn&apos;t find that page.</p>
      <Link href="/" className="mt-6"><Button>Back home</Button></Link>
    </div>
  );
}
