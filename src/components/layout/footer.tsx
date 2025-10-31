import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="font-display text-lg font-semibold">College Bazaar</div>
          <p className="mt-2 text-sm text-ink-500">
            Buy and sell college essentials, peer to peer. Built for students, by students.
          </p>
        </div>
        <FooterCol title="Product">
          <Link href="/browse">Browse</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/wishlist">Wishlist</Link>
        </FooterCol>
        <FooterCol title="Company">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/#testimonials">Testimonials</Link>
        </FooterCol>
        <FooterCol title="Legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
        </FooterCol>
      </div>
      <div className="border-t border-ink-200 py-5 text-center text-xs text-ink-500 dark:border-ink-800">
        © {new Date().getFullYear()} College Bazaar. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 flex flex-col gap-2 text-sm text-ink-500 [&_a:hover]:text-ink-900 dark:[&_a:hover]:text-white">
        {children}
      </div>
    </div>
  );
}
