import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Ваша корзина покупок в интернет-магазине.",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
