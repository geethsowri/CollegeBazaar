"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Plus, Search, ShoppingBag, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils/cn";

interface Me {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
}

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setMe(j?.data?.user ?? null))
      .catch(() => setMe(null));
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/80 backdrop-blur dark:border-ink-800 dark:bg-ink-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-ink-900 text-white dark:bg-white dark:text-ink-900">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">College Bazaar</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/browse" active={pathname.startsWith("/browse")}>Browse</NavLink>
          <NavLink href="/sell" active={pathname.startsWith("/sell")}>Sell</NavLink>
          {me ? <NavLink href="/dashboard" active={pathname.startsWith("/dashboard")}>Dashboard</NavLink> : null}
          {me ? <NavLink href="/messages" active={pathname.startsWith("/messages")}>Messages</NavLink> : null}
          {me?.role === "admin" ? <NavLink href="/admin" active={pathname.startsWith("/admin")}>Admin</NavLink> : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/browse">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {me ? (
            <>
              <Link href="/sell"><Button size="sm"><Plus className="h-4 w-4" /> Sell</Button></Link>
              <Link href="/profile" className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-sm font-semibold dark:bg-ink-800" aria-label="Profile">
                {me.avatarUrl ? (
                  <img src={me.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  me.name.charAt(0).toUpperCase()
                )}
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link href="/signup"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-ink-200 bg-white p-4 md:hidden dark:border-ink-800 dark:bg-ink-950">
          <div className="flex flex-col gap-1">
            <MobileLink href="/browse" onClick={() => setOpen(false)}>Browse</MobileLink>
            <MobileLink href="/sell" onClick={() => setOpen(false)}>Sell</MobileLink>
            {me ? <MobileLink href="/dashboard" onClick={() => setOpen(false)}>Dashboard</MobileLink> : null}
            {me ? <MobileLink href="/messages" onClick={() => setOpen(false)}>Messages</MobileLink> : null}
            {me ? <MobileLink href="/orders" onClick={() => setOpen(false)}>Orders</MobileLink> : null}
            {me ? <MobileLink href="/wishlist" onClick={() => setOpen(false)}>Wishlist</MobileLink> : null}
            {me ? <MobileLink href="/profile" onClick={() => setOpen(false)}>Profile</MobileLink> : null}
            {!me ? (
              <>
                <MobileLink href="/login" onClick={() => setOpen(false)}>Log in</MobileLink>
                <MobileLink href="/signup" onClick={() => setOpen(false)}>Sign up</MobileLink>
              </>
            ) : (
              <button onClick={logout} className="rounded-xl p-3 text-left text-sm hover:bg-ink-100 dark:hover:bg-ink-800">
                Log out
              </button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white"
          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-xl p-3 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800">
      {children}
    </Link>
  );
}
