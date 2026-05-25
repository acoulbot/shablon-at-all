import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

function checkAdmin(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  const payload = verifyToken(token);
  return !!payload && payload.role === "admin";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const keys = url.searchParams.get("keys");
  if (!keys) {
    const all = await prisma.siteContent.findMany();
    return Response.json(all);
  }
  const keyArr = keys.split(",").map((k) => k.trim()).filter(Boolean);
  const items = await prisma.siteContent.findMany({ where: { key: { in: keyArr } } });
  const map: Record<string, string> = {};
  for (const item of items) map[item.key] = item.value;
  return Response.json(map);
}

export async function PUT(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const { key, value } = await request.json();
  if (!key) return Response.json({ error: "Key обязателен" }, { status: 400 });

  const item = await prisma.siteContent.upsert({
    where: { key },
    create: { key, value: value ?? "" },
    update: { value: value ?? "" },
  });
  return Response.json(item);
}

export async function PATCH(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const { items } = await request.json() as { items: { key: string; value: string }[] };
  if (!Array.isArray(items)) return Response.json({ error: "items обязателен" }, { status: 400 });

  await Promise.all(
    items.map((item) =>
      prisma.siteContent.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value ?? "" },
        update: { value: item.value ?? "" },
      })
    )
  );

  return Response.json({ success: true });
}
