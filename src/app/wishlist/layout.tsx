import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Избранное — VapeLabHIT",
  description: "Ваши избранные товары в интернет-магазине VapeLabHIT. Сохраняйте понравившиеся товары и покупайте по лучшей цене.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
