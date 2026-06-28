import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, Leaf, Wallet, Users, Star, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Listing } from "@/models/Listing";
import { dbConnect } from "@/lib/db/mongoose";
import { ListingCard, type ListingCardData } from "@/components/product/listing-card";

export const revalidate = 60;

async function getFeatured(): Promise<ListingCardData[]> {
  try {
    await dbConnect();
    const items = await Listing.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("seller", "name avatarUrl")
      .lean();
    return JSON.parse(JSON.stringify(items));
  } catch {
    return [];
  }
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Suspense fallback={<FeaturedSkeleton />}><Featured /></Suspense>
      <Benefits />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200">
              <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-emerald-500" />
              For verified college students only
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Buy affordable college essentials from peers.
            </h1>
            <p className="mt-5 max-w-xl text-base text-ink-500 sm:text-lg">
              Mini drafters. Calculators. Lab aprons. Get them at student prices from seniors who don&apos;t need them anymore.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/browse">
                <Button size="lg">Browse listings <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="outline">Sell your stuff</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <Stat label="Average savings" value="62%" />
              <Stat label="Verified students" value="college email only" />
              <Stat label="Categories" value="3 essentials" />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 mx-auto h-[420px] w-[420px] rounded-full bg-ink-100 blur-3xl dark:bg-ink-800/40" />
            <div className="grid grid-cols-2 gap-4">
              <HeroCard label="Mini Drafter" price="₹650" cut="₹1,400" />
              <HeroCard label="Calculator" price="₹520" cut="₹1,200" className="translate-y-6" />
              <HeroCard label="Lab Apron" price="₹180" cut="₹400" className="-translate-y-2" />
              <HeroCard label="Drafter Kit" price="₹820" cut="₹1,800" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-ink-900 dark:text-white">{value}</span>
      <span>·</span>
      <span>{label}</span>
    </div>
  );
}

function HeroCard({ label, price, cut, className = "" }: { label: string; price: string; cut: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink-200 bg-white p-4 shadow-soft dark:border-ink-700 dark:bg-ink-900 ${className}`}>
      <div className="aspect-square rounded-xl bg-gradient-to-b from-ink-50 to-ink-100 dark:from-ink-800 dark:to-ink-900" />
      <div className="mt-3">
        <div className="text-xs text-ink-500">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold">{price}</span>
          <span className="text-xs text-ink-400 line-through">{cut}</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: BadgeCheck, title: "Verify with college email", desc: "We confirm you're a student. Trust starts there." },
    { icon: MessageCircle, title: "Find or list an item", desc: "Browse what seniors are selling, or list your old gear." },
    { icon: ShieldCheck, title: "Pay securely. Pick up.", desc: "Razorpay checkout, then meet on campus." },
  ];
  return (
    <section id="how-it-works" className="border-y border-ink-200 bg-ink-50/50 dark:border-ink-800 dark:bg-ink-900/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mt-3 max-w-xl text-ink-500">Three simple steps. No middlemen. No markup.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900 text-white dark:bg-white dark:text-ink-900">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function Featured() {
  const items = await getFeatured();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Featured listings</h2>
          <p className="mt-2 text-ink-500">Freshly posted by your peers.</p>
        </div>
        <Link href="/browse" className="hidden text-sm font-medium hover:underline sm:inline">
          View all →
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink-200 p-12 text-center text-ink-500 dark:border-ink-700">
          No listings yet. Be the first to <Link href="/sell" className="font-medium text-ink-900 underline dark:text-white">post one</Link>.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => <ListingCard key={it._id} listing={it} />)}
        </div>
      )}
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Skeleton className="h-8 w-64" />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: Wallet, title: "Save up to 70%", desc: "Used college gear costs a fraction of new — same job, lower price." },
    { icon: Leaf, title: "Less waste", desc: "Drafters and aprons get one term of use. Let's keep them in circulation." },
    { icon: Users, title: "Trust the network", desc: "College-email signup. Senior-to-junior. No randos." },
  ];
  return (
    <section className="bg-ink-50/50 dark:bg-ink-900/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Why students love it</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
              <Icon className="h-6 w-6" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Anjali, CSE'27", quote: "Got my drafter for ₹600 from a 4th-year. Literally saved me from buying new on day one." },
    { name: "Rohan, ME'26", quote: "Sold both my apron and calc in two days. Easier than putting it on a WhatsApp group." },
    { name: "Priya, BT'27", quote: "Loved that everyone is verified. Felt safer than meeting a random seller online." },
  ];
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Loved on campus</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <div key={t.name} className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
            <div className="flex gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="mt-3 text-sm">{t.quote}</p>
            <p className="mt-4 text-xs font-medium text-ink-500">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Who can use College Bazaar?", a: "Only verified students with a recognised college email can sign up." },
    { q: "What can I sell?", a: "Right now: mini drafters, calculators, and lab aprons. Other categories will be rejected." },
    { q: "How do payments work?", a: "Buyers pay via Razorpay. Once payment clears, you coordinate pickup on campus." },
    { q: "Do you take a cut?", a: "No platform fees during the early access phase." },
  ];
  return (
    <section id="faq" className="border-t border-ink-200 bg-ink-50/50 dark:border-ink-800 dark:bg-ink-900/30">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">FAQ</h2>
        <div className="mt-8 divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-900">
          {items.map((i) => (
            <details key={i.q} className="group p-6">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                {i.q}
                <span className="text-ink-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-ink-500">{i.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-ink-200 bg-ink-900 p-10 text-white sm:p-14 dark:border-ink-700">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Skip the bookstore. Buy from a senior.
        </h2>
        <p className="mt-3 max-w-xl text-ink-300">
          Sign up with your college email and start saving — or start selling — in under a minute.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup"><Button size="lg" variant="secondary">Create account</Button></Link>
          <Link href="/browse"><Button size="lg" variant="ghost" className="bg-transparent text-white hover:bg-white/10">Browse first</Button></Link>
        </div>
      </div>
    </section>
  );
}
