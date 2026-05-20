import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { autoCategorize } from "@/lib/auto-categorize";
import { slugify } from "@/lib/slugify";

function checkAdmin(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  const payload = verifyToken(token);
  return !!payload && payload.role === "admin";
}

// POST: suggest category + brand for a product name
export async function POST(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const body = await request.json();
  const { name, tags } = body;

  if (!name) {
    return Response.json({ error: "Название обязательно" }, { status: 400 });
  }

  const result = autoCategorize(name);

  let categoryId: string | null = null;
  if (result.category) {
    const cat = await prisma.category.findFirst({
      where: { name: result.category },
    });
    categoryId = cat?.id ?? null;
  }

  return Response.json({
    suggestedCategory: result.category,
    suggestedCategoryId: categoryId,
    suggestedBrand: result.brand,
    tags: tags || "",
  });
}

// PUT: bulk auto-categorize all products (or selected ones)
export async function PUT(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const body = await request.json();
  const { ids, createMissingCategories } = body as {
    ids?: string[];
    createMissingCategories?: boolean;
  };

  const where = ids && ids.length > 0 ? { id: { in: ids } } : {};
  const products = await prisma.product.findMany({ where, include: { category: true } });

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  let updated = 0;
  let skipped = 0;
  let categoriesCreated = 0;
  const results: { id: string; name: string; category: string | null; brand: string | null; status: string }[] = [];

  for (const product of products) {
    const suggestion = autoCategorize(product.name);

    if (!suggestion.category && !suggestion.brand) {
      skipped++;
      results.push({ id: product.id, name: product.name, category: null, brand: null, status: "skipped" });
      continue;
    }

    const updateData: { categoryId?: string; brand?: string } = {};

    if (suggestion.brand) {
      updateData.brand = suggestion.brand;
    }

    if (suggestion.category) {
      let catId = categoryMap.get(suggestion.category);
      if (!catId && createMissingCategories) {
        const slug = slugify(suggestion.category);
        const existing = await prisma.category.findFirst({ where: { slug } });
        if (existing) {
          catId = existing.id;
          categoryMap.set(suggestion.category, catId);
        } else {
          const maxOrder = categories.reduce((max, c) => Math.max(max, c.order), 0);
          const newCat = await prisma.category.create({
            data: {
              name: suggestion.category,
              slug,
              order: maxOrder + 1,
            },
          });
          catId = newCat.id;
          categoryMap.set(suggestion.category, catId);
          categories.push(newCat);
          categoriesCreated++;
        }
      }
      if (catId) {
        updateData.categoryId = catId;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });
      updated++;
      results.push({ id: product.id, name: product.name, category: suggestion.category, brand: suggestion.brand, status: "updated" });
    } else {
      skipped++;
      results.push({ id: product.id, name: product.name, category: suggestion.category, brand: suggestion.brand, status: "skipped_no_category_found" });
    }
  }

  return Response.json({
    total: products.length,
    updated,
    skipped,
    categoriesCreated,
    results: results.slice(0, 50),
  });
}
