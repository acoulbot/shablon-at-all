import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Ваши избранные товары.",
  robots: { index: false, follow: true },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
