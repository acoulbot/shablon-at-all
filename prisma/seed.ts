import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

function slug(name: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return name.toLowerCase().split("").map(c => map[c] || c).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  // Admin — create default only if no admins exist (first install)
  const existingAdmins = await prisma.admin.count();
  if (existingAdmins === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.admin.create({
      data: { username: "admin", password: hashedPassword },
    });
    console.log("Default admin created (login: admin). Change password after first login!");
  } else {
    console.log(`Skipping admin seed — ${existingAdmins} admin(s) already exist.`);
  }

  // Top-level categories for vape shop
  const cats = [
    { name: "Испарители", icon: "💨", order: 1 },
    { name: "Картриджи", icon: "🔋", order: 2 },
    { name: "Аккумуляторы и батарейки", icon: "🔌", order: 3 },
    { name: "Зарядные устройства", icon: "⚡", order: 4 },
    { name: "Шнуры и зарядки", icon: "🔗", order: 5 },
    { name: "Powerbank Walker", icon: "🏦", order: 6 },
    { name: "Вата", icon: "☁️", order: 7 },
  ];

  const topCats: Record<string, string> = {};
  for (const c of cats) {
    const s = slug(c.name);
    const cat = await prisma.category.upsert({
      where: { slug: s },
      update: {},
      create: { name: c.name, slug: s, icon: c.icon, order: c.order },
    });
    topCats[c.name] = cat.id;
  }

  // Subcategories
  const subCats: Record<string, { name: string; parent: string }[]> = {
    "Испарители": [
      { name: "Одноразовые испарители", parent: "Испарители" },
      { name: "Pod-системы", parent: "Испарители" },
      { name: "Стартовые наборы", parent: "Испарители" },
      { name: "Боксмоды", parent: "Испарители" },
    ],
    "Картриджи": [
      { name: "Сменные картриджи", parent: "Картриджи" },
      { name: "Картриджи с жидкостью", parent: "Картриджи" },
      { name: "Пустые картриджи", parent: "Картриджи" },
    ],
    "Аккумуляторы и батарейки": [
      { name: "Аккумуляторы 18650", parent: "Аккумуляторы и батарейки" },
      { name: "Аккумуляторы 21700", parent: "Аккумуляторы и батарейки" },
      { name: "Батарейки AA/AAA", parent: "Аккумуляторы и батарейки" },
      { name: "Литиевые батарейки", parent: "Аккумуляторы и батарейки" },
    ],
    "Зарядные устройства": [
      { name: "Зарядки для аккумуляторов", parent: "Зарядные устройства" },
      { name: "Сетевые адаптеры", parent: "Зарядные устройства" },
      { name: "Автомобильные зарядки", parent: "Зарядные устройства" },
    ],
    "Шнуры и зарядки": [
      { name: "USB Type-C кабели", parent: "Шнуры и зарядки" },
      { name: "Micro-USB кабели", parent: "Шнуры и зарядки" },
      { name: "Lightning кабели", parent: "Шнуры и зарядки" },
    ],
    "Powerbank Walker": [
      { name: "Powerbank 5000 mAh", parent: "Powerbank Walker" },
      { name: "Powerbank 10000 mAh", parent: "Powerbank Walker" },
      { name: "Powerbank 20000 mAh", parent: "Powerbank Walker" },
    ],
    "Вата": [
      { name: "Хлопковая вата", parent: "Вата" },
      { name: "Японская вата", parent: "Вата" },
      { name: "Шнуры для намотки", parent: "Вата" },
    ],
  };

  const allCats: Record<string, string> = { ...topCats };
  for (const [parentName, subs] of Object.entries(subCats)) {
    let order = 1;
    for (const sub of subs) {
      const s = slug(sub.name);
      const cat = await prisma.category.upsert({
        where: { slug: s },
        update: {},
        create: { name: sub.name, slug: s, order: order++, parentId: topCats[parentName] },
      });
      allCats[sub.name] = cat.id;
    }
  }

  // Products
  const products = [
    // Одноразовые испарители
    { name: "HQD Cuvie Plus 1200 затяжек", price: 590, oldPrice: 750, inStock: 100, brand: "HQD", cat: "Одноразовые испарители", type: "одноразовый" },
    { name: "Elf Bar BC5000", price: 990, inStock: 80, brand: "Elf Bar", cat: "Одноразовые испарители", type: "одноразовый" },
    { name: "IGET Bar 3500 затяжек", price: 850, oldPrice: 1100, inStock: 60, brand: "IGET", cat: "Одноразовые испарители", type: "одноразовый" },
    { name: "Lost Mary BM5000", price: 890, inStock: 70, brand: "Lost Mary", cat: "Одноразовые испарители", type: "одноразовый" },
    // Pod-системы
    { name: "SMOK Nord 5 Pod Kit", price: 2500, oldPrice: 3200, inStock: 25, brand: "SMOK", cat: "Pod-системы", type: "pod" },
    { name: "Vaporesso XROS 3 Mini", price: 1900, inStock: 35, brand: "Vaporesso", cat: "Pod-системы", type: "pod" },
    { name: "Uwell Caliburn G2", price: 2200, inStock: 20, brand: "Uwell", cat: "Pod-системы", type: "pod" },
    // Стартовые наборы
    { name: "GeekVape Aegis Legend 2 Kit", price: 5500, oldPrice: 6800, inStock: 10, brand: "GeekVape", cat: "Стартовые наборы", type: "набор" },
    { name: "Voopoo Drag X Plus Kit", price: 4500, inStock: 15, brand: "Voopoo", cat: "Стартовые наборы", type: "набор" },
    // Боксмоды
    { name: "Vaporesso GEN 200 Mod", price: 4200, inStock: 12, brand: "Vaporesso", cat: "Боксмоды", type: "мод" },
    { name: "SMOK Morph 3 Mod", price: 3800, oldPrice: 4500, inStock: 8, brand: "SMOK", cat: "Боксмоды", type: "мод" },
    // Сменные картриджи
    { name: "Картридж SMOK Nord 5 0.8 Ом (3шт)", price: 650, inStock: 50, brand: "SMOK", cat: "Сменные картриджи", type: "картридж" },
    { name: "Картридж Vaporesso XROS 0.6 Ом (2шт)", price: 450, oldPrice: 550, inStock: 40, brand: "Vaporesso", cat: "Сменные картриджи", type: "картридж" },
    { name: "Картридж Uwell Caliburn G2 1.2 Ом (2шт)", price: 480, inStock: 35, brand: "Uwell", cat: "Сменные картриджи", type: "картридж" },
    // Картриджи с жидкостью
    { name: "Картридж Juul Табак 18мг (4шт)", price: 1200, inStock: 30, brand: "Juul", cat: "Картриджи с жидкостью", type: "заправленный" },
    { name: "Картридж Juul Мята 12мг (4шт)", price: 1200, oldPrice: 1400, inStock: 25, brand: "Juul", cat: "Картриджи с жидкостью", type: "заправленный" },
    // Пустые картриджи
    { name: "Пустой картридж для Juul (4шт)", price: 350, inStock: 60, brand: "Совместимый", cat: "Пустые картриджи", type: "пустой" },
    // Аккумуляторы 18650
    { name: "Sony VTC6 18650 3000mAh 30A", price: 750, oldPrice: 900, inStock: 50, brand: "Sony", cat: "Аккумуляторы 18650", type: "18650" },
    { name: "Samsung 25R 18650 2500mAh 20A", price: 600, inStock: 40, brand: "Samsung", cat: "Аккумуляторы 18650", type: "18650" },
    { name: "LG HG2 18650 3000mAh 20A", price: 680, inStock: 35, brand: "LG", cat: "Аккумуляторы 18650", type: "18650" },
    // Аккумуляторы 21700
    { name: "Samsung 40T 21700 4000mAh 30A", price: 950, inStock: 20, brand: "Samsung", cat: "Аккумуляторы 21700", type: "21700" },
    { name: "Molicel P42A 21700 4200mAh 45A", price: 1100, oldPrice: 1300, inStock: 15, brand: "Molicel", cat: "Аккумуляторы 21700", type: "21700" },
    // Батарейки
    { name: "Duracell AA 1.5V (4шт)", price: 350, inStock: 100, brand: "Duracell", cat: "Батарейки AA/AAA", type: "AA" },
    { name: "Energizer AAA 1.5V (4шт)", price: 320, oldPrice: 380, inStock: 80, brand: "Energizer", cat: "Батарейки AA/AAA", type: "AAA" },
    // Зарядки для аккумуляторов
    { name: "Nitecore i2 зарядное устройство", price: 1500, oldPrice: 1900, inStock: 20, brand: "Nitecore", cat: "Зарядки для аккумуляторов", type: "зарядка" },
    { name: "XTAR VC4 Plus зарядное устройство", price: 2800, inStock: 10, brand: "XTAR", cat: "Зарядки для аккумуляторов", type: "зарядка" },
    { name: "Efest LUC V4 зарядное устройство", price: 2200, inStock: 12, brand: "Efest", cat: "Зарядки для аккумуляторов", type: "зарядка" },
    // Сетевые адаптеры
    { name: "Сетевой адаптер QC3.0 18W", price: 650, inStock: 50, brand: "Walker", cat: "Сетевые адаптеры", type: "адаптер" },
    { name: "Сетевой адаптер PD 20W USB-C", price: 850, oldPrice: 1000, inStock: 40, brand: "Walker", cat: "Сетевые адаптеры", type: "адаптер" },
    // Автомобильные зарядки
    { name: "Автозарядка Walker 2xUSB 3.1A", price: 550, inStock: 30, brand: "Walker", cat: "Автомобильные зарядки", type: "авто" },
    // USB Type-C кабели
    { name: "Кабель USB Type-C 1м Walker C725", price: 350, inStock: 100, brand: "Walker", cat: "USB Type-C кабели", type: "кабель" },
    { name: "Кабель USB Type-C 2м Walker C755", price: 450, oldPrice: 550, inStock: 60, brand: "Walker", cat: "USB Type-C кабели", type: "кабель" },
    // Micro-USB кабели
    { name: "Кабель Micro-USB 1м Walker C530", price: 250, inStock: 80, brand: "Walker", cat: "Micro-USB кабели", type: "кабель" },
    // Lightning кабели
    { name: "Кабель Lightning 1м Walker C910", price: 550, inStock: 40, brand: "Walker", cat: "Lightning кабели", type: "кабель" },
    // Powerbank Walker
    { name: "Powerbank Walker WB-510 5000mAh", price: 1200, oldPrice: 1500, inStock: 30, brand: "Walker", cat: "Powerbank 5000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-710 10000mAh", price: 1800, inStock: 25, brand: "Walker", cat: "Powerbank 10000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-910 10000mAh QC", price: 2200, oldPrice: 2700, inStock: 15, brand: "Walker", cat: "Powerbank 10000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-920 20000mAh PD", price: 3200, inStock: 10, brand: "Walker", cat: "Powerbank 20000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-950 20000mAh QC+PD", price: 3800, oldPrice: 4500, inStock: 8, brand: "Walker", cat: "Powerbank 20000 mAh", type: "powerbank" },
    // Хлопковая вата
    { name: "Вата Cotton Bacon Prime", price: 350, inStock: 60, brand: "Wick 'N' Vape", cat: "Хлопковая вата", type: "хлопок" },
    { name: "Вата Native Wicks Platinum", price: 450, oldPrice: 550, inStock: 30, brand: "Native Wicks", cat: "Хлопковая вата", type: "хлопок" },
    // Японская вата
    { name: "Вата Muji японская (180шт)", price: 280, inStock: 50, brand: "Muji", cat: "Японская вата", type: "японская" },
    { name: "Вата Puff японская органическая", price: 320, inStock: 40, brand: "Puff", cat: "Японская вата", type: "японская" },
    // Шнуры для намотки
    { name: "Проволока Кантал A1 26ga (10м)", price: 250, inStock: 45, brand: "UD", cat: "Шнуры для намотки", type: "проволока" },
    { name: "Проволока нихром Ni80 24ga (10м)", price: 280, oldPrice: 350, inStock: 35, brand: "UD", cat: "Шнуры для намотки", type: "проволока" },
  ];

  for (const p of products) {
    const s = slug(p.name);
    const catId = allCats[p.cat];
    if (!catId) { console.log(`Category not found: ${p.cat}`); continue; }
    await prisma.product.upsert({
      where: { slug: s },
      update: {},
      create: {
        name: p.name, slug: s, price: p.price, oldPrice: p.oldPrice ?? null,
        inStock: p.inStock, brand: p.brand, categoryId: catId,
        productType: p.type, description: `${p.name} — ${p.brand}. Качественная продукция для вейпа в интернет-магазине VapeLabHIT.`,
      },
    });
  }

  // Slider images
  const existingSlides = await prisma.sliderImage.findMany();
  if (existingSlides.length === 0) {
    const slidesData = [
      { title: "Всё для вейпа в одном месте", subtitle: "Испарители, картриджи, аккумуляторы и аксессуары", imageUrl: "/slider/slide1.svg", link: "/catalog/ispariteli", order: 1 },
      { title: "Powerbank Walker — заряд на ходу", subtitle: "От 5000 до 20000 mAh с быстрой зарядкой", imageUrl: "/slider/slide2.svg", link: "/catalog/powerbank-walker", order: 2 },
      { title: "Быстрая доставка по России", subtitle: "Надёжная упаковка и оперативная отправка", imageUrl: "/slider/slide3.svg", link: "/catalog", order: 3 },
    ];
    for (const slide of slidesData) {
      await prisma.sliderImage.create({ data: slide });
    }
  }

  // Sample news
  const newsItems = [
    {
      title: "Открытие магазина VapeLabHIT",
      content: "<p>Рады приветствовать вас в нашем интернет-магазине <strong>VapeLabHIT</strong>!</p><p>У нас вы найдёте широкий ассортимент вейп-продукции: испарители, картриджи, аккумуляторы, зарядные устройства, Powerbank Walker и аксессуары.</p><p><a href='/catalog'>Перейти в каталог →</a></p>",
      published: true,
    },
    {
      title: "Новая коллекция Powerbank Walker",
      content: "<p>Представляем обновлённую линейку <strong>Powerbank Walker</strong> — от компактных моделей на 5000 mAh до мощных на 20000 mAh с поддержкой Quick Charge и Power Delivery.</p><p><a href='/catalog/powerbank-walker'>Смотреть Powerbank Walker →</a></p>",
      published: true,
    },
    {
      title: "Скидки на аккумуляторы и зарядные устройства",
      content: "<p>Только на этой неделе — скидки до <strong>25%</strong> на аккумуляторы Sony, Samsung, LG и зарядные устройства Nitecore, XTAR.</p><p><a href='/catalog/akkumulyatory-i-batarejki'>Смотреть аккумуляторы →</a></p>",
      published: true,
    },
  ];

  for (const n of newsItems) {
    const s = slug(n.title);
    await prisma.news.upsert({
      where: { slug: s },
      update: {},
      create: { title: n.title, slug: s, content: n.content, published: n.published },
    });
  }

  console.log("Seed completed successfully");
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
