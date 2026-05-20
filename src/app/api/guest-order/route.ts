import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GuestCartItem {
  productId: string;
  quantity: number;
  isPack?: boolean;
}

export async function POST(req: NextRequest) {
  const { name, phone, email, address, comment, items } = await req.json() as {
    name: string;
    phone: string;
    email: string;
    address: string;
    comment: string;
    items: GuestCartItem[];
  };

  if (!name || !phone || !email) {
    return NextResponse.json({ error: "Имя, телефон и email обязательны" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 11) {
    return NextResponse.json({ error: "Телефон должен содержать 11 цифр (+7...)" }, { status: 400 });
  }

  if (/\d/.test(name)) {
    return NextResponse.json({ error: "Имя должно содержать только буквы" }, { status: 400 });
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let total = 0;
  const orderItems: { productId: string; quantity: number; price: number }[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    const price = item.isPack
      ? Math.round(product.price * item.quantity * 0.9)
      : product.price * item.quantity;
    total += price;
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const order = await prisma.order.create({
    data: {
      name,
      phone,
      email,
      address: address || "",
      comment: comment || "",
      total,
      items: {
        create: orderItems,
      },
    },
  });

  return NextResponse.json({ success: true, id: order.id });
}
