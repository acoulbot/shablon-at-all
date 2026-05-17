import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Возврат и обмен — CloudStuff",
  description: "Условия возврата и обмена товаров в интернет-магазине CloudStuff. Возврат в течение 14 дней без лишних вопросов.",
  alternates: { canonical: "https://cloudstuff.ru/returns" },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
