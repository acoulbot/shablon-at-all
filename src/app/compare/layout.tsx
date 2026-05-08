import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сравнение товаров",
  description: "Сравните характеристики товаров для выбора лучшего варианта.",
  robots: { index: false, follow: true },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
