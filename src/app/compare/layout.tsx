import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сравнение товаров — CloudStuff",
  description: "Сравните характеристики и цены выбранных товаров в интернет-магазине CloudStuff. Выберите лучший вариант.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
