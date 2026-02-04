import { redirect } from "next/navigation";
import { Suspense } from "react";
import PaymentSuccessContent from "@/components/PaymentSuccessContent";

export default function PaymentSuccessPage() {
  const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";
  if (!checkoutEnabled) {
    redirect("/?checkout=disabled");
  }

  return (
    <Suspense fallback={<div />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
