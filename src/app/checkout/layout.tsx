import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description: "Оформите заказ с доставкой или самовывозом.",
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
