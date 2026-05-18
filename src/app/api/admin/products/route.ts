import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { autoCategorize } from "@/lib/auto-categorize";

function checkAdmin(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  const payload = verifyToken(token);
  return !!payload && payload.role === "admin";
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return Response.json(products);
}

export async function POST(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const body = await request.json();
  const { name, description, price, oldPrice, image, inStock, packSize, expirationDate, brand, color, productType, categoryId, isFeatured, tags } = body;

  if (!name || !price) {
    return Response.json({ error: "Название и цена обязательны" }, { status: 400 });
  }

  // Auto-detect brand and category if not provided
  const suggestion = autoCategorize(name);
  const finalBrand = brand || suggestion.brand || "";
  let finalCategoryId = categoryId;

  if (!finalCategoryId && suggestion.category) {
    const cat = await prisma.category.findFirst({ where: { name: suggestion.category } });
    if (cat) {
      finalCategoryId = cat.id;
    } else {
      const catSlug = slugify(suggestion.category);
      const allCats = await prisma.category.findMany();
      const maxOrder = allCats.reduce((max, c) => Math.max(max, c.order), 0);
      const newCat = await prisma.category.create({ data: { name: suggestion.category, slug: catSlug, order: maxOrder + 1 } });
      finalCategoryId = newCat.id;
    }
  }

  if (!finalCategoryId) {
    const defaultCat = await prisma.category.findFirst({ orderBy: { order: "asc" } });
    if (!defaultCat) return Response.json({ error: "Нет категорий в базе" }, { status: 400 });
    finalCategoryId = defaultCat.id;
  }

  let slug = slugify(name);
  const existing = await prisma.product.findFirst({ where: { slug } });
  if (existing) {
    let counter = 2;
    while (await prisma.product.findFirst({ where: { slug: `${slug}-${counter}` } })) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }
  const product = await prisma.product.create({
    data: {
      name, slug, description: description || "", price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null, image: image || "",
      inStock: Number(inStock) || 0, packSize: packSize ? Number(packSize) : null,
      expirationDate: expirationDate || "", brand: finalBrand, color: color || "",
      productType: productType || "", categoryId: finalCategoryId, isFeatured: !!isFeatured,
      tags: tags || "",
    },
  });
  return Response.json(product, { status: 201 });
}

export async function PUT(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const body = await request.json();

  // Bulk stock update for all products
  if (body.bulkStock !== undefined) {
    const result = await prisma.product.updateMany({
      data: { inStock: Number(body.bulkStock) },
    });
    return Response.json({ success: true, updated: result.count });
  }

  // Bulk category assignment
  if (body.ids && body.categoryId) {
    const result = await prisma.product.updateMany({
      where: { id: { in: body.ids } },
      data: { categoryId: body.categoryId },
    });
    return Response.json({ success: true, updated: result.count });
  }

  const { id, name, description, price, oldPrice, image, image2, image3, image4, inStock, packSize, expirationDate, brand, color, productType, categoryId, isFeatured, tags } = body;

  if (!id || !name || !price) {
    return Response.json({ error: "Обязательные поля не заполнены" }, { status: 400 });
  }

  // Auto-detect brand and category if not provided
  const suggestion = autoCategorize(name);
  const finalBrand = brand || suggestion.brand || "";
  let finalCategoryId = categoryId;

  if (!finalCategoryId && suggestion.category) {
    const cat = await prisma.category.findFirst({ where: { name: suggestion.category } });
    if (cat) {
      finalCategoryId = cat.id;
    } else {
      const catSlug = slugify(suggestion.category);
      const allCats = await prisma.category.findMany();
      const maxOrder = allCats.reduce((max, c) => Math.max(max, c.order), 0);
      const newCat = await prisma.category.create({ data: { name: suggestion.category, slug: catSlug, order: maxOrder + 1 } });
      finalCategoryId = newCat.id;
    }
  }

  if (!finalCategoryId) {
    const defaultCat = await prisma.category.findFirst({ orderBy: { order: "asc" } });
    if (!defaultCat) return Response.json({ error: "Нет категорий в базе" }, { status: 400 });
    finalCategoryId = defaultCat.id;
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name, description: description || "", price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null, image: image || "",
      image2: image2 || "", image3: image3 || "", image4: image4 || "",
      inStock: Number(inStock) || 0, packSize: packSize ? Number(packSize) : null,
      expirationDate: expirationDate || "", brand: finalBrand, color: color || "",
      productType: productType || "", categoryId: finalCategoryId, isFeatured: !!isFeatured,
      tags: tags || "",
    },
  });
  return Response.json(product);
}

export async function DELETE(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const body = await request.json();
  const { id, ids } = body as { id?: string; ids?: string[] };

  if (ids && ids.length > 0) {
    const result = await prisma.product.deleteMany({ where: { id: { in: ids } } });
    return Response.json({ success: true, deleted: result.count });
  }

  if (!id) {
    return Response.json({ error: "ID обязателен" }, { status: 400 });
  }

  await prisma.product.delete({ where: { id } });
  return Response.json({ success: true, deleted: 1 });
}
