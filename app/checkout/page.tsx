import { redirect } from "next/navigation";
import CheckoutContent from "@/components/CheckoutContent";

export default function CheckoutPage() {
  const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";
  if (!checkoutEnabled) {
    redirect("/?checkout=disabled");
  }
  return <CheckoutContent />;
}
