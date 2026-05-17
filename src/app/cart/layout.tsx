import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Корзина — CloudStuff",
  description: "Ваша корзина покупок в интернет-магазине CloudStuff. Проверьте выбранные товары и оформите заказ с доставкой по Москве и МО.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
