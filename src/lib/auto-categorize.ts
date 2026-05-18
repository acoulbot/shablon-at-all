interface CategoryRule {
  pattern: RegExp;
  category: string;
  subcategory?: string;
}

interface BrandRule {
  pattern: RegExp;
  brand: string;
}

const categoryRules: CategoryRule[] = [
  { pattern: /^ЭС\s/i, category: "Электронные сигареты" },
  { pattern: /^ОСДН\s/i, category: "Одноразовые электронные сигареты" },
  { pattern: /^ЭСДН\s/i, category: "Одноразовые электронные сигареты" },
  { pattern: /^Сменный картридж/i, category: "Картриджи и испарители" },
  { pattern: /^Картридж/i, category: "Картриджи и испарители" },
  { pattern: /^Испаритель/i, category: "Картриджи и испарители" },
  { pattern: /^Бестабачная смесь/i, category: "Бестабачные смеси для кальяна" },
  { pattern: /^Табак для кальяна/i, category: "Табак для кальяна" },
  { pattern: /Табак жевательный/i, category: "Жевательный табак" },
  { pattern: /^Зажигалка/i, category: "Аксессуары" },
  { pattern: /Дрип.?Тип/i, category: "Аксессуары" },
  { pattern: /^Бумажный фильтр/i, category: "Аксессуары" },
  { pattern: /^Жидкость/i, category: "Жидкости для вейпа" },
  { pattern: /^Вата\s/i, category: "Аксессуары" },
  { pattern: /^Проволока/i, category: "Аксессуары" },
  { pattern: /^Чехол/i, category: "Чехлы и кейсы" },
  { pattern: /^Кейс/i, category: "Чехлы и кейсы" },
  { pattern: /^Кабель/i, category: "Кабели и шнуры" },
  { pattern: /^Зарядк/i, category: "Зарядные устройства" },
  { pattern: /^Адаптер/i, category: "Зарядные устройства" },
  { pattern: /^Powerbank/i, category: "Powerbank" },
  { pattern: /^Пауэрбанк/i, category: "Powerbank" },
];

const brandRules: BrandRule[] = [
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

export interface AutoCategorizeResult {
  category: string | null;
  brand: string | null;
}

export function autoCategorize(productName: string): AutoCategorizeResult {
  let category: string | null = null;
  let brand: string | null = null;

  for (const rule of categoryRules) {
    if (rule.pattern.test(productName)) {
      category = rule.category;
      break;
    }
  }

  for (const rule of brandRules) {
    if (rule.pattern.test(productName)) {
      brand = rule.brand;
      break;
    }
  }

  return { category, brand };
}

export function autoCategorizeWithTags(productName: string, tags: string): AutoCategorizeResult {
  const result = autoCategorize(productName);

  if (!result.category && tags) {
    const combined = `${productName} ${tags}`;
    for (const rule of categoryRules) {
      if (rule.pattern.test(combined)) {
        result.category = rule.category;
        break;
      }
    }
  }

  if (!result.brand && tags) {
    const combined = `${productName} ${tags}`;
    for (const rule of brandRules) {
      if (rule.pattern.test(combined)) {
        result.brand = rule.brand;
        break;
      }
    }
  }

  return result;
}
