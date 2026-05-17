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

  // Top-level categories for accessories store
  const cats = [
    { name: "Чехлы и кейсы", icon: "🛡️", order: 1 },
    { name: "Зарядные устройства", icon: "⚡", order: 2 },
    { name: "Кабели и шнуры", icon: "🔌", order: 3 },
    { name: "Powerbank", icon: "🔋", order: 4 },
    { name: "Вейп-аксессуары", icon: "💨", order: 5 },
    { name: "Защитные стёкла и плёнки", icon: "📱", order: 6 },
    { name: "Держатели и подставки", icon: "📐", order: 7 },
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
    "Чехлы и кейсы": [
      { name: "Чехлы для вейпов", parent: "Чехлы и кейсы" },
      { name: "Кейсы для переноски", parent: "Чехлы и кейсы" },
      { name: "Чехлы для смартфонов", parent: "Чехлы и кейсы" },
      { name: "Чехлы для наушников", parent: "Чехлы и кейсы" },
    ],
    "Зарядные устройства": [
      { name: "Сетевые адаптеры", parent: "Зарядные устройства" },
      { name: "Беспроводные зарядки", parent: "Зарядные устройства" },
      { name: "Автомобильные зарядки", parent: "Зарядные устройства" },
      { name: "Зарядки для аккумуляторов", parent: "Зарядные устройства" },
    ],
    "Кабели и шнуры": [
      { name: "USB Type-C кабели", parent: "Кабели и шнуры" },
      { name: "Lightning кабели", parent: "Кабели и шнуры" },
      { name: "Micro-USB кабели", parent: "Кабели и шнуры" },
      { name: "Универсальные кабели 3-в-1", parent: "Кабели и шнуры" },
    ],
    "Powerbank": [
      { name: "Powerbank 5000 mAh", parent: "Powerbank" },
      { name: "Powerbank 10000 mAh", parent: "Powerbank" },
      { name: "Powerbank 20000 mAh", parent: "Powerbank" },
    ],
    "Вейп-аксессуары": [
      { name: "Картриджи и испарители", parent: "Вейп-аксессуары" },
      { name: "Дрип-типы", parent: "Вейп-аксессуары" },
      { name: "Вата и проволока", parent: "Вейп-аксессуары" },
      { name: "Жидкости для вейпа", parent: "Вейп-аксессуары" },
    ],
    "Защитные стёкла и плёнки": [
      { name: "Стёкла для смартфонов", parent: "Защитные стёкла и плёнки" },
      { name: "Плёнки для планшетов", parent: "Защитные стёкла и плёнки" },
      { name: "Защита для часов", parent: "Защитные стёкла и плёнки" },
    ],
    "Держатели и подставки": [
      { name: "Автомобильные держатели", parent: "Держатели и подставки" },
      { name: "Настольные подставки", parent: "Держатели и подставки" },
      { name: "Кольца-держатели", parent: "Держатели и подставки" },
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
    // Чехлы для вейпов
    { name: "Чехол силиконовый для SMOK Nord 5", price: 350, oldPrice: 450, inStock: 80, brand: "CloudStuff", cat: "Чехлы для вейпов", type: "чехол" },
    { name: "Кожаный чехол для Vaporesso XROS", price: 590, inStock: 40, brand: "CloudStuff", cat: "Чехлы для вейпов", type: "чехол" },
    { name: "Чехол-карабин для pod-систем", price: 450, inStock: 60, brand: "CloudStuff", cat: "Чехлы для вейпов", type: "чехол" },
    // Кейсы для переноски
    { name: "Кейс EVA для вейпа и аксессуаров", price: 890, oldPrice: 1100, inStock: 30, brand: "CloudStuff", cat: "Кейсы для переноски", type: "кейс" },
    { name: "Дорожный органайзер для электроники", price: 1200, inStock: 25, brand: "CloudStuff", cat: "Кейсы для переноски", type: "кейс" },
    // Чехлы для смартфонов
    { name: "Чехол прозрачный iPhone 15 Pro", price: 490, inStock: 100, brand: "Walker", cat: "Чехлы для смартфонов", type: "чехол" },
    { name: "Чехол противоударный Samsung S24", price: 590, oldPrice: 750, inStock: 70, brand: "Walker", cat: "Чехлы для смартфонов", type: "чехол" },
    { name: "Чехол-книжка Xiaomi Redmi Note 13", price: 550, inStock: 50, brand: "Walker", cat: "Чехлы для смартфонов", type: "чехол" },
    // Чехлы для наушников
    { name: "Чехол для AirPods Pro 2 силикон", price: 390, inStock: 90, brand: "Walker", cat: "Чехлы для наушников", type: "чехол" },
    { name: "Чехол для Samsung Galaxy Buds 3", price: 350, oldPrice: 450, inStock: 60, brand: "Walker", cat: "Чехлы для наушников", type: "чехол" },
    // Сетевые адаптеры
    { name: "Сетевой адаптер QC3.0 18W", price: 650, inStock: 50, brand: "Walker", cat: "Сетевые адаптеры", type: "адаптер" },
    { name: "Сетевой адаптер PD 20W USB-C", price: 850, oldPrice: 1000, inStock: 40, brand: "Walker", cat: "Сетевые адаптеры", type: "адаптер" },
    { name: "Сетевой адаптер GaN 65W 2xUSB-C", price: 1800, inStock: 20, brand: "Baseus", cat: "Сетевые адаптеры", type: "адаптер" },
    // Беспроводные зарядки
    { name: "Беспроводная зарядка Qi 15W", price: 990, oldPrice: 1300, inStock: 35, brand: "Walker", cat: "Беспроводные зарядки", type: "зарядка" },
    { name: "Магнитная зарядка MagSafe 15W", price: 1500, inStock: 20, brand: "Baseus", cat: "Беспроводные зарядки", type: "зарядка" },
    // Автомобильные зарядки
    { name: "Автозарядка Walker 2xUSB 3.1A", price: 550, inStock: 30, brand: "Walker", cat: "Автомобильные зарядки", type: "авто" },
    { name: "Автозарядка PD 30W + USB QC3.0", price: 890, oldPrice: 1100, inStock: 25, brand: "Baseus", cat: "Автомобильные зарядки", type: "авто" },
    // Зарядки для аккумуляторов
    { name: "Nitecore i2 зарядное устройство", price: 1500, oldPrice: 1900, inStock: 20, brand: "Nitecore", cat: "Зарядки для аккумуляторов", type: "зарядка" },
    { name: "XTAR VC4 Plus зарядное устройство", price: 2800, inStock: 10, brand: "XTAR", cat: "Зарядки для аккумуляторов", type: "зарядка" },
    // USB Type-C кабели
    { name: "Кабель USB Type-C 1м Walker C725", price: 350, inStock: 100, brand: "Walker", cat: "USB Type-C кабели", type: "кабель" },
    { name: "Кабель USB Type-C 2м Walker C755", price: 450, oldPrice: 550, inStock: 60, brand: "Walker", cat: "USB Type-C кабели", type: "кабель" },
    { name: "Кабель Type-C to Type-C 100W 1.5м", price: 690, inStock: 40, brand: "Baseus", cat: "USB Type-C кабели", type: "кабель" },
    // Lightning кабели
    { name: "Кабель Lightning 1м Walker C910", price: 550, inStock: 40, brand: "Walker", cat: "Lightning кабели", type: "кабель" },
    { name: "Кабель Lightning 2м усиленный", price: 750, oldPrice: 900, inStock: 30, brand: "Walker", cat: "Lightning кабели", type: "кабель" },
    // Micro-USB кабели
    { name: "Кабель Micro-USB 1м Walker C530", price: 250, inStock: 80, brand: "Walker", cat: "Micro-USB кабели", type: "кабель" },
    // Универсальные кабели
    { name: "Кабель 3-в-1 Type-C/Lightning/Micro", price: 590, inStock: 50, brand: "Walker", cat: "Универсальные кабели 3-в-1", type: "кабель" },
    // Powerbank
    { name: "Powerbank Walker WB-510 5000mAh", price: 1200, oldPrice: 1500, inStock: 30, brand: "Walker", cat: "Powerbank 5000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-710 10000mAh", price: 1800, inStock: 25, brand: "Walker", cat: "Powerbank 10000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-910 10000mAh QC", price: 2200, oldPrice: 2700, inStock: 15, brand: "Walker", cat: "Powerbank 10000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-920 20000mAh PD", price: 3200, inStock: 10, brand: "Walker", cat: "Powerbank 20000 mAh", type: "powerbank" },
    { name: "Powerbank Walker WB-950 20000mAh QC+PD", price: 3800, oldPrice: 4500, inStock: 8, brand: "Walker", cat: "Powerbank 20000 mAh", type: "powerbank" },
    // Картриджи и испарители
    { name: "Картридж SMOK Nord 5 0.8 Ом (3шт)", price: 650, inStock: 50, brand: "SMOK", cat: "Картриджи и испарители", type: "картридж" },
    { name: "Картридж Vaporesso XROS 0.6 Ом (2шт)", price: 450, oldPrice: 550, inStock: 40, brand: "Vaporesso", cat: "Картриджи и испарители", type: "картридж" },
    { name: "Картридж Uwell Caliburn G2 1.2 Ом (2шт)", price: 480, inStock: 35, brand: "Uwell", cat: "Картриджи и испарители", type: "картридж" },
    // Дрип-типы
    { name: "Дрип-тип 510 сталь/смола", price: 250, inStock: 45, brand: "CloudStuff", cat: "Дрип-типы", type: "дрип-тип" },
    { name: "Дрип-тип 810 широкий PEI", price: 320, oldPrice: 400, inStock: 30, brand: "CloudStuff", cat: "Дрип-типы", type: "дрип-тип" },
    // Вата и проволока
    { name: "Вата Cotton Bacon Prime", price: 350, inStock: 60, brand: "Wick 'N' Vape", cat: "Вата и проволока", type: "вата" },
    { name: "Проволока Кантал A1 26ga (10м)", price: 250, inStock: 45, brand: "UD", cat: "Вата и проволока", type: "проволока" },
    // Защитные стёкла
    { name: "Защитное стекло iPhone 15 Pro 9H", price: 390, inStock: 80, brand: "Walker", cat: "Стёкла для смартфонов", type: "стекло" },
    { name: "Защитное стекло Samsung S24 Ultra", price: 490, oldPrice: 650, inStock: 50, brand: "Walker", cat: "Стёкла для смартфонов", type: "стекло" },
    { name: "Защитное стекло Xiaomi 14", price: 350, inStock: 60, brand: "Walker", cat: "Стёкла для смартфонов", type: "стекло" },
    // Плёнки для планшетов
    { name: "Защитная плёнка iPad Air матовая", price: 450, inStock: 30, brand: "Walker", cat: "Плёнки для планшетов", type: "плёнка" },
    // Защита для часов
    { name: "Защитное стекло Apple Watch 9 45мм", price: 350, oldPrice: 450, inStock: 40, brand: "Walker", cat: "Защита для часов", type: "стекло" },
    // Автомобильные держатели
    { name: "Автодержатель магнитный MagSafe", price: 890, inStock: 35, brand: "Baseus", cat: "Автомобильные держатели", type: "держатель" },
    { name: "Автодержатель на присоске универс.", price: 590, oldPrice: 750, inStock: 40, brand: "Walker", cat: "Автомобильные держатели", type: "держатель" },
    // Настольные подставки
    { name: "Подставка для смартфона алюминий", price: 690, inStock: 25, brand: "CloudStuff", cat: "Настольные подставки", type: "подставка" },
    { name: "Подставка-док для зарядки 3-в-1", price: 1900, oldPrice: 2500, inStock: 15, brand: "Baseus", cat: "Настольные подставки", type: "подставка" },
    // Кольца-держатели
    { name: "Кольцо-держатель MagSafe", price: 350, inStock: 70, brand: "Walker", cat: "Кольца-держатели", type: "кольцо" },
    { name: "PopSocket универсальный", price: 290, oldPrice: 390, inStock: 100, brand: "CloudStuff", cat: "Кольца-держатели", type: "кольцо" },
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
        productType: p.type, description: `${p.name} — ${p.brand}. Качественный аксессуар в интернет-магазине CloudStuff.`,
      },
    });
  }

  // Slider images
  const existingSlides = await prisma.sliderImage.findMany();
  if (existingSlides.length === 0) {
    const slidesData = [
      { title: "Аксессуары для ваших устройств", subtitle: "Чехлы, кейсы, зарядки, кабели и powerbank", imageUrl: "/slider/slide1.svg", link: "/catalog", order: 1 },
      { title: "Powerbank — заряд на ходу", subtitle: "От 5000 до 20000 mAh с быстрой зарядкой", imageUrl: "/slider/slide2.svg", link: "/catalog/powerbank", order: 2 },
      { title: "Быстрая доставка по России", subtitle: "Надёжная упаковка и оперативная отправка", imageUrl: "/slider/slide3.svg", link: "/catalog", order: 3 },
    ];
    for (const slide of slidesData) {
      await prisma.sliderImage.create({ data: slide });
    }
  }

  // Sample news
  const newsItems = [
    {
      title: "Открытие магазина CloudStuff",
      content: "<p>Рады приветствовать вас в нашем интернет-магазине <strong>CloudStuff</strong>!</p><p>У нас вы найдёте широкий ассортимент аксессуаров для электронных устройств и вейпов: чехлы, кейсы, зарядные устройства, кабели, powerbank и многое другое.</p><p><a href='/catalog'>Перейти в каталог →</a></p>",
      published: true,
    },
    {
      title: "Новая коллекция Powerbank Walker",
      content: "<p>Представляем обновлённую линейку <strong>Powerbank Walker</strong> — от компактных моделей на 5000 mAh до мощных на 20000 mAh с поддержкой Quick Charge и Power Delivery.</p><p><a href='/catalog/powerbank'>Смотреть Powerbank →</a></p>",
      published: true,
    },
    {
      title: "Скидки на защитные стёкла и чехлы",
      content: "<p>Только на этой неделе — скидки до <strong>30%</strong> на защитные стёкла Walker и чехлы для смартфонов. Успейте обновить защиту!</p><p><a href='/catalog/chekhly-i-kejsy'>Смотреть чехлы →</a></p>",
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
