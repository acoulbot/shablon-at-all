import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Избранное — CloudStuff",
  description: "Ваши избранные товары в интернет-магазине CloudStuff. Сохраняйте понравившиеся товары и покупайте по лучшей цене.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
