"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, ShoppingBag, Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  listingId: string;
  sellerId: string;
  isSold: boolean;
}

declare global {
  interface Window { Razorpay?: any }
}

export function ProductActions({ listingId, sellerId, isSold }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");

  const startChat = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      router.push(`/messages/${json.data.conversation._id}`);
    } catch (e: any) {
      if (e?.message === "unauthenticated") router.push("/login?next=/product/" + listingId);
      else toast.error(e?.message ?? "Could not start chat");
    } finally { setBusy(false); }
  };

  const wishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      toast.success("Added to wishlist");
    } catch (e: any) {
      if (e?.message === "unauthenticated") router.push("/login");
      else toast.error(e?.message ?? "Failed");
    }
  };

  const checkout = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      const { razorpayOrderId, amount, keyId } = json.data;

      if (!window.Razorpay) {
        toast.error("Razorpay failed to load");
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: amount * 100,
        currency: "INR",
        name: "College Bazaar",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          const v = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const vj = await v.json();
          if (vj.ok) {
            toast.success("Payment successful");
            router.push("/orders");
          } else toast.error("Payment verification failed");
        },
        theme: { color: "#18181b" },
      });
      rzp.open();
    } catch (e: any) {
      if (e?.message === "unauthenticated") router.push("/login");
      else toast.error(e?.message ?? "Checkout failed");
    } finally { setBusy(false); }
  };

  const submitReport = async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message);
      toast.success("Reported. We'll review.");
      setReportOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button size="lg" onClick={checkout} disabled={busy || isSold}>
          <ShoppingBag className="h-4 w-4" /> {isSold ? "Already sold" : "Buy now"}
        </Button>
        <Button size="lg" variant="outline" onClick={startChat} disabled={busy}>
          <MessageCircle className="h-4 w-4" /> Chat with seller
        </Button>
        <Button size="lg" variant="ghost" onClick={wishlist}>
          <Heart className="h-4 w-4" /> Save to wishlist
        </Button>
        <Button size="lg" variant="ghost" onClick={() => setReportOpen(true)}>
          <Flag className="h-4 w-4" /> Report listing
        </Button>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen} title="Report this listing" description="Help us keep College Bazaar safe.">
        <div className="flex flex-col gap-3">
          <Select
            label="Reason"
            value={reportReason}
            onValueChange={setReportReason}
            options={[
              { value: "spam", label: "Spam" },
              { value: "fake", label: "Fake / scam" },
              { value: "inappropriate", label: "Inappropriate" },
              { value: "wrong_category", label: "Wrong category" },
              { value: "other", label: "Other" },
            ]}
          />
          <Textarea label="Details (optional)" value={reportDetails} onChange={(e) => setReportDetails(e.currentTarget.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={submitReport}>Submit report</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
