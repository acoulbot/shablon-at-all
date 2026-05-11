import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет — VapeLabHIT",
  description: "Личный кабинет покупателя VapeLabHIT. Управляйте заказами, профилем и адресами доставки.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
