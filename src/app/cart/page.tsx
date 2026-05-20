"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState, useEffect, startTransition } from "react";

interface LocalCartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  isPack: boolean;
}

function getCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items: LocalCartItem[]) {
  localStorage.setItem("cart", JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export default function CartPage() {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    startTransition(() => {
      setItems(getCart());
      setLoading(false);
    });
  }, []);

  const updateQty = (productId: string, quantity: number, isPack: boolean) => {
    if (quantity < 1) {
      const updated = items.filter((i) => !(i.productId === productId && i.isPack === isPack));
      setItems(updated);
      saveCart(updated);
    } else {
      const updated = items.map((i) => (i.productId === productId && i.isPack === isPack) ? { ...i, quantity } : i);
      setItems(updated);
      saveCart(updated);
    }
  };

  const removeItem = (productId: string, isPack: boolean) => {
    const updated = items.filter((i) => !(i.productId === productId && i.isPack === isPack));
    setItems(updated);
    saveCart(updated);
  };

  const getItemPrice = (item: LocalCartItem) => {
    if (item.isPack) return Math.round(item.price * item.quantity * 0.9);
    return item.price * item.quantity;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const packDiscount = items.filter(i => i.isPack).reduce((sum, item) => sum + Math.round(item.price * item.quantity * 0.1), 0);
  const discountAmount = promoDiscount
    ? promoDiscount.discountType === "percent"
      ? Math.round(subtotal * promoDiscount.discountValue / 100)
      : promoDiscount.discountValue
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const applyPromo = async () => {
    setPromoError("");
    if (!promoCode.trim()) return;
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoDiscount({ code: data.code, discountType: data.discountType, discountValue: data.discountValue });
      } else {
        setPromoError(data.error || "Недействительный промокод");
        setPromoDiscount(null);
      }
    } catch {
      setPromoError("Ошибка проверки промокода");
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-bg-light">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text-dark mb-4 sm:mb-6">Корзина</h1>

          {loading && <p className="text-text-gray text-center py-8">Загрузка...</p>}

          {!loading && items.length === 0 && (
            <div className="bg-bg-white rounded-xl border border-border p-8 text-center">
              <p className="text-text-gray mb-4">Корзина пуста</p>
              <Link href="/catalog" className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Перейти в каталог
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.isPack}`} className={`bg-bg-white rounded-xl border ${item.isPack ? "border-green-300" : "border-border"} p-3 sm:p-4`}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-bg-light rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                        {item.image ? (
                          <img src={item.image.startsWith("/uploads/") ? `/api${item.image}` : item.image.startsWith("/") ? `/api/static${item.image}` : item.image} alt="" className="w-full h-full object-contain p-1 rounded-lg" />
                        ) : "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-dark text-sm sm:text-base truncate">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-text-gray">
                          {item.isPack
                            ? `Упаковка — скидка 10%`
                            : `${item.price.toLocaleString("ru-RU")} ₽ за шт.`}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.isPack)} className="text-text-gray hover:text-danger transition-colors flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3 pl-[3.75rem] sm:pl-[5rem]">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.productId, item.quantity - 1, item.isPack)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border ${item.isPack ? "border-green-300 text-green-600 hover:bg-green-50" : "border-border hover:bg-bg-light"} flex items-center justify-center text-sm`}>−</button>
                        <span className={`w-6 sm:w-8 text-center font-medium text-sm ${item.isPack ? "text-green-700" : ""}`}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.quantity + 1, item.isPack)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border ${item.isPack ? "border-green-300 text-green-600 hover:bg-green-50" : "border-border hover:bg-bg-light"} flex items-center justify-center text-sm`}>+</button>
                      </div>
                      <p className={`font-bold text-sm sm:text-base ${item.isPack ? "text-green-600" : "text-primary"}`}>{getItemPrice(item).toLocaleString("ru-RU")} ₽</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="mt-4 bg-bg-white rounded-xl border border-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Промокод"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={applyPromo} className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    Применить
                  </button>
                </div>
                {promoError && <p className="text-danger text-xs mt-2">{promoError}</p>}
                {promoDiscount && (
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-success">Промокод «{promoDiscount.code}» применён</span>
                    <button onClick={() => { setPromoDiscount(null); setPromoCode(""); }} className="text-text-gray hover:text-danger text-xs">Убрать</button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="mt-4 bg-bg-white rounded-xl border border-border p-4 sm:p-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-text-gray">
                    <span>Товаров: {items.reduce((s, i) => s + i.quantity, 0)}</span>
                    <span>{(subtotal + packDiscount).toLocaleString("ru-RU")} ₽</span>
                  </div>
                  {packDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Скидка за упаковку (−10%)</span>
                      <span>−{packDiscount.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Скидка по промокоду</span>
                      <span>-{discountAmount.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-lg font-bold text-text-dark">Итого</span>
                    <span className="text-lg font-bold text-text-dark">{total.toLocaleString("ru-RU")} ₽</span>
                  </div>
                </div>
                <Link href="/checkout" className="block w-full bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-lg transition-colors font-medium text-lg text-center">
                  Оформить заказ
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
