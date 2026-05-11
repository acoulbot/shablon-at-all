import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Возврат и обмен — VapeLabHIT",
  description: "Условия возврата и обмена товаров в интернет-магазине VapeLabHIT. Возврат в течение 14 дней без лишних вопросов.",
  alternates: { canonical: "https://vapelabhit.ru/returns" },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
