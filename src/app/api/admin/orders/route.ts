import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { sendOrderStatusUpdate } from "@/lib/email";

function checkAdmin(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  const payload = verifyToken(token);
  return !!payload && payload.role === "admin";
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true, name: true } }, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(orders);
}

export async function PUT(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  const { id, status, trackNumber, trackUrl } = await request.json();
  if (!id || !status) return Response.json({ error: "Укажите id и статус" }, { status: 400 });

  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) return Response.json({ error: "Заказ не найден" }, { status: 404 });

  const updateData: Record<string, string> = { status };
  if (trackNumber !== undefined) updateData.trackNumber = trackNumber;
  if (trackUrl !== undefined) updateData.trackUrl = trackUrl;

  const order = await prisma.order.update({ where: { id }, data: updateData });

  if (existingOrder.status !== status && order.email) {
    try {
      await sendOrderStatusUpdate(
        order.email,
        order.id,
        status,
        order.trackNumber || undefined,
        order.trackUrl || undefined,
      );
    } catch (err) {
      console.error("Order status email failed:", err);
    }
  }

  return Response.json(order);
}

export async function DELETE(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  const { id } = await request.json();
  if (!id) return Response.json({ error: "Укажите id" }, { status: 400 });
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return Response.json({ error: "Заказ не найден" }, { status: 404 });
  if (order.status !== "cancelled" && order.status !== "delivered") {
    return Response.json({ error: "Удалять можно только отменённые или завершённые заказы" }, { status: 400 });
  }
  await prisma.order.delete({ where: { id } });
  return Response.json({ success: true });
}
