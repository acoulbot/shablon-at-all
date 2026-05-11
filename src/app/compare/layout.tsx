import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сравнение товаров — VapeLabHIT",
  description: "Сравните характеристики и цены выбранных товаров в интернет-магазине VapeLabHIT. Выберите лучший вариант.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
