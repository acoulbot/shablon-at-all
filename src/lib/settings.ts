import { prisma } from "./prisma";
import { cache } from "react";

export type Settings = {
  id: string;
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  email: string;
  emailWholesale: string;
  emailSuppliers: string;
  address: string;
  workingHours: string;
  pickupAddress: string;
  pickupHours: string;
  socialTelegram: string;
  socialVk: string;
  socialWhatsapp: string;
  colorPrimary: string;
  colorAccent: string;
  colorDanger: string;
  colorSuccess: string;
  colorBgLight: string;
  ogTitle: string;
  ogDescription: string;
  footerText: string;
  packDiscount: number;
  freeDeliveryFrom: number;
};

const defaultSettings: Settings = {
  id: "main",
  siteName: "Мой магазин",
  siteDescription: "Интернет-магазин товаров",
  siteKeywords: "",
  logoUrl: "",
  faviconUrl: "",
  phone: "",
  email: "",
  emailWholesale: "",
  emailSuppliers: "",
  address: "",
  workingHours: "ПН-ПТ с 09:00 до 18:00",
  pickupAddress: "",
  pickupHours: "",
  socialTelegram: "",
  socialVk: "",
  socialWhatsapp: "",
  colorPrimary: "#e94560",
  colorAccent: "#f59e0b",
  colorDanger: "#ef4444",
  colorSuccess: "#22c55e",
  colorBgLight: "#f8f9fa",
  ogTitle: "",
  ogDescription: "",
  footerText: "",
  packDiscount: 10,
  freeDeliveryFrom: 5000,
};

export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) {
      return defaultSettings;
    }
    return settings as unknown as Settings;
  } catch {
    return defaultSettings;
  }
});
