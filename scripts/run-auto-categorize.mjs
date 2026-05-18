/**
 * Standalone script to run auto-categorization on all products.
 * Usage: node scripts/run-auto-categorize.mjs
 * Run from the project root (/var/www/cloudstuff)
 */

// Category rules (mirrors src/lib/auto-categorize.ts)
const categoryRules = [
  { pattern: /^Набор\s/i, category: "Pod-системы и наборы" },
  { pattern: /\bKit\b/i, category: "Pod-системы и наборы" },
  { pattern: /^DIGI\s/i, category: "Pod-системы и наборы" },
  { pattern: /^ЭС\s/i, category: "Электронные сигареты" },
  { pattern: /^ОСДН\s/i, category: "Одноразовые электронные сигареты" },
  { pattern: /^ЭСДН\s/i, category: "Одноразовые электронные сигареты" },
  { pattern: /^Сменный картридж/i, category: "Картриджи и испарители" },
  { pattern: /^Картридж/i, category: "Картриджи и испарители" },
  { pattern: /^Испаритель/i, category: "Картриджи и испарители" },
  { pattern: /^Обслуживаемая\s/i, category: "Картриджи и испарители" },
  { pattern: /^Бестабачная смесь/i, category: "Бестабачные смеси для кальяна" },
  { pattern: /^Табак для кальяна/i, category: "Табак для кальяна" },
  { pattern: /Табак жевательный/i, category: "Жевательный табак" },
  { pattern: /^BRELLOCK\s/i, category: "Аксессуары" },
  { pattern: /^Зажигалка/i, category: "Аксессуары" },
  { pattern: /Дрип.?Тип/i, category: "Аксессуары" },
  { pattern: /^Бумажный фильтр/i, category: "Аксессуары" },
  { pattern: /^Адаптер\s/i, category: "Аксессуары" },
  { pattern: /^Жидкость/i, category: "Жидкости для вейпа" },
  { pattern: /^Вата\s/i, category: "Аксессуары" },
  { pattern: /^Проволока/i, category: "Аксессуары" },
  { pattern: /shaker/i, category: "Аксессуары" },
  { pattern: /^Чехол/i, category: "Чехлы и кейсы" },
  { pattern: /^Кейс/i, category: "Чехлы и кейсы" },
  { pattern: /^Кабель/i, category: "Кабели и шнуры" },
  { pattern: /^Зарядк/i, category: "Зарядные устройства" },
  { pattern: /^Powerbank/i, category: "Powerbank" },
  { pattern: /^Пауэрбанк/i, category: "Powerbank" },
];

const brandRules = [
  { pattern: /Vaporesso/i, brand: "Vaporesso" },
  { pattern: /Voopoo/i, brand: "Voopoo" },
  { pattern: /Geekvape|Geek\s*Vape/i, brand: "Geekvape" },
  { pattern: /Smoant/i, brand: "Smoant" },
  { pattern: /BRELLOCK/i, brand: "BRELLOCK" },
  { pattern: /DIGI\b/i, brand: "DIGI" },
  { pattern: /UpBOX|Upox/i, brand: "UpBOX" },
  { pattern: /Aspire/i, brand: "Aspire" },
  { pattern: /Uwell/i, brand: "Uwell" },
  { pattern: /Rincoe/i, brand: "Rincoe" },
  { pattern: /BRUSKO|Brusko/i, brand: "BRUSKO" },
  { pattern: /HAPPMAN/i, brand: "HAPPMAN" },
  { pattern: /ANGRY\s*CHEW/i, brand: "ANGRY CHEW" },
  { pattern: /ULTRAMAN/i, brand: "ULTRAMAN" },
  { pattern: /SKALA/i, brand: "SKALA" },
  { pattern: /LANAVAPE/i, brand: "LANAVAPE" },
  { pattern: /PODONKI/i, brand: "PODONKI" },
  { pattern: /ELFBAR|Elf\s*Bar/i, brand: "ELF BAR" },
  { pattern: /HQD/i, brand: "HQD" },
  { pattern: /LOST\s*MARY/i, brand: "LOST MARY" },
  { pattern: /WAKA/i, brand: "WAKA" },
  { pattern: /GEEK\s*BAR/i, brand: "GEEK BAR" },
];

function autoCategorize(name) {
  let category = null, brand = null;
  for (const r of categoryRules) { if (r.pattern.test(name)) { category = r.category; break; } }
  for (const r of brandRules) { if (r.pattern.test(name)) { brand = r.brand; break; } }
  return { category, brand };
}

function slugify(text) {
  const map = {
    а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"j",к:"k",
    л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",
    ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"
  };
  return text.toLowerCase().replace(/[а-яё]/g, c => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Use better-sqlite3 directly
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "dev.db");

const db = new Database(dbPath);

console.log("Starting auto-categorization...\n");

// Get all products
const products = db.prepare("SELECT id, name, brand, categoryId FROM Product").all();
console.log(`Total products: ${products.length}`);

// Get all categories
const categoriesRaw = db.prepare("SELECT id, name, slug, \"order\" FROM Category").all();
const categoryMap = new Map(categoriesRaw.map(c => [c.name, c.id]));
let maxOrder = categoriesRaw.reduce((max, c) => Math.max(max, c.order), 0);

let updated = 0;
let skipped = 0;
let categoriesCreated = 0;
const catDistribution = {};

const updateStmt = db.prepare("UPDATE Product SET categoryId = ?, brand = ? WHERE id = ?");
const insertCat = db.prepare("INSERT INTO Category (id, name, slug, icon, \"order\", metaTitle, metaDescription, seoText) VALUES (?, ?, ?, '', ?, '', '', '')");

const transaction = db.transaction(() => {
  for (const product of products) {
    const suggestion = autoCategorize(product.name);

    if (!suggestion.category && !suggestion.brand) {
      skipped++;
      continue;
    }

    let catId = product.categoryId;
    if (suggestion.category) {
      catId = categoryMap.get(suggestion.category);
      if (!catId) {
        const slug = slugify(suggestion.category);
        const id = crypto.randomUUID();
        maxOrder++;
        insertCat.run(id, suggestion.category, slug, maxOrder);
        catId = id;
        categoryMap.set(suggestion.category, catId);
        categoriesCreated++;
        console.log(`  Created category: ${suggestion.category}`);
      }
      catDistribution[suggestion.category] = (catDistribution[suggestion.category] || 0) + 1;
    }

    const brand = suggestion.brand || product.brand || "";
    updateStmt.run(catId, brand, product.id);
    updated++;
  }
});

transaction();

console.log(`\nResults:`);
console.log(`  Updated: ${updated}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Categories created: ${categoriesCreated}`);
console.log(`\nCategory distribution:`);
for (const [cat, count] of Object.entries(catDistribution).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

db.close();
console.log("\nDone!");
