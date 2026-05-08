import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Управление вашим аккаунтом, заказами и настройками.",
  robots: { index: false, follow: true },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
