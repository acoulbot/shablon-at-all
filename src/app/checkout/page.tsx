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

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits.startsWith("7") ? digits : "7" + digits;
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ")";
  if (d.length > 4) result += " " + d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

const steps = [
  { id: 1, label: "Корзина" },
  { id: 2, label: "Данные" },
  { id: 3, label: "Подтверждение" },
];

export default function CheckoutPage() {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [form, setForm] = useState({ name: "", surname: "", phone: "", email: "", address: "", comment: "" });
  const [isPickup, setIsPickup] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    startTransition(() => setItems(getCart()));
  }, []);

  const total = items.reduce((sum, item) => {
    if (item.isPack) return sum + Math.round(item.price * item.quantity * 0.9);
    return sum + item.price * item.quantity;
  }, 0);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Введите имя";
    } else if (/\d/.test(form.name)) {
      errors.name = "Имя должно содержать только буквы";
    }

    if (!form.surname.trim()) {
      errors.surname = "Введите фамилию";
    } else if (/\d/.test(form.surname)) {
      errors.surname = "Фамилия должна содержать только буквы";
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) {
      errors.phone = "Введите телефон";
    } else if (!phoneDigits.startsWith("79") || phoneDigits.length !== 11) {
      errors.phone = "Формат: +7 (9XX) XXX-XX-XX";
    }

    if (!form.email.trim()) {
      errors.email = "Введите email";
    } else if (!form.email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Email должен содержать @";
    }

    if (!isPickup && (!form.address.trim() || form.address.trim().length < 10)) {
      errors.address = "Укажите полный адрес (город, улица, дом)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) { setStep(2); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/guest-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.name.trim()} ${form.surname.trim()}`,
          phone: form.phone,
          email: form.email.trim(),
          address: isPickup ? "Самовывоз" : form.address.trim(),
          comment: form.comment.trim(),
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, isPack: i.isPack })),
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error); return; }
      setOrderId(data.id);
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      setLoading(false);
      setError("Ошибка при оформлении заказа");
    }
  };

  if (orderId) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-bg-light">
          <div className="max-w-md mx-auto px-4 py-10 text-center">
            <div className="bg-bg-white rounded-xl border border-border p-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-dark mb-2">Заказ оформлен!</h1>
              <p className="text-text-gray mb-4">Номер заказа: #{orderId.slice(0, 8)}</p>
              <p className="text-sm text-text-gray mb-6">Мы свяжемся с вами для подтверждения</p>
              <Link href="/catalog" className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark font-medium">В каталог</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-bg-light">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text-dark mb-4 sm:mb-6">Оформление заказа</h1>

          {/* Steps indicator */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button onClick={() => { if (s.id < step) setStep(s.id); }}
                  className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    step === s.id ? "bg-primary text-white" : step > s.id ? "bg-success/10 text-success cursor-pointer" : "bg-bg-white text-text-gray border border-border"
                  }`}>
                  {step > s.id ? (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] sm:text-xs">{s.id}</span>
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.id}</span>
                </button>
                {i < steps.length - 1 && <div className={`w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1 ${step > s.id ? "bg-success" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="md:col-span-2">
              {/* Step 1: Cart review */}
              {step === 1 && (
                <div className="bg-bg-white rounded-xl border border-border p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-text-dark mb-3 sm:mb-4">Проверьте состав заказа</h2>
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text-gray mb-4">Корзина пуста</p>
                      <Link href="/catalog" className="text-primary hover:underline">Перейти в каталог</Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={`${item.productId}-${item.isPack}`} className="flex items-center gap-4 p-3 bg-bg-light rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-dark">{item.name}</p>
                              <p className="text-xs text-text-gray">{item.quantity} шт. × {item.price.toLocaleString("ru-RU")} ₽</p>
                            </div>
                            <span className="font-medium text-text-dark">{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setStep(2)}
                        className="w-full mt-4 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                        Далее — Заполнить данные
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Contact & delivery info */}
              {step === 2 && (
                <div className="bg-bg-white rounded-xl border border-border p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-text-dark mb-3 sm:mb-4">Контактные данные</h2>
                  {error && <p className="text-danger text-sm mb-4">{error}</p>}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-text-gray mb-1 block">Имя *</label>
                        <input type="text" value={form.name}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[0-9]/g, "");
                            setForm({ ...form, name: val });
                            if (fieldErrors.name) setFieldErrors((prev) => { const n = { ...prev }; delete n.name; return n; });
                          }}
                          placeholder="Иван"
                          className={`w-full border ${fieldErrors.name ? "border-danger" : "border-border"} rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary`} />
                        {fieldErrors.name && <p className="text-danger text-xs mt-1">{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <label className="text-sm text-text-gray mb-1 block">Фамилия *</label>
                        <input type="text" value={form.surname}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[0-9]/g, "");
                            setForm({ ...form, surname: val });
                            if (fieldErrors.surname) setFieldErrors((prev) => { const n = { ...prev }; delete n.surname; return n; });
                          }}
                          placeholder="Иванов"
                          className={`w-full border ${fieldErrors.surname ? "border-danger" : "border-border"} rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary`} />
                        {fieldErrors.surname && <p className="text-danger text-xs mt-1">{fieldErrors.surname}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-text-gray mb-1 block">Телефон * <span className="text-text-light">(+7 9XX XXX-XX-XX)</span></label>
                      <input type="tel" value={form.phone}
                        onChange={(e) => {
                          setForm({ ...form, phone: formatPhone(e.target.value) });
                          if (fieldErrors.phone) setFieldErrors((prev) => { const n = { ...prev }; delete n.phone; return n; });
                        }}
                        placeholder="+7 (9__) ___-__-__"
                        className={`w-full border ${fieldErrors.phone ? "border-danger" : "border-border"} rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary`} />
                      {fieldErrors.phone && <p className="text-danger text-xs mt-1">{fieldErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="text-sm text-text-gray mb-1 block">Email *</label>
                      <input type="email" value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (fieldErrors.email) setFieldErrors((prev) => { const n = { ...prev }; delete n.email; return n; });
                        }}
                        placeholder="email@example.com"
                        className={`w-full border ${fieldErrors.email ? "border-danger" : "border-border"} rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary`} />
                      {fieldErrors.email && <p className="text-danger text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div className="border-t border-border pt-3 mt-3">
                      <h3 className="text-sm font-medium text-text-dark mb-2">Способ получения</h3>
                      <div className="flex gap-2">
                        <button onClick={() => { setIsPickup(false); setForm({ ...form, address: "" }); }}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${!isPickup ? "bg-primary text-white" : "bg-bg-light text-text-gray border border-border"}`}>
                          Доставка
                        </button>
                        <button onClick={() => { setIsPickup(true); setForm({ ...form, address: "Самовывоз" }); }}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${isPickup ? "bg-green-600 text-white" : "bg-bg-light text-text-gray border border-border"}`}>
                          Самовывоз
                        </button>
                      </div>
                    </div>
                    {isPickup && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                        <p className="font-medium">Москва, ул. Складочная, 1, стр. 18</p>
                        <p>Пн–Пт с 11:00 до 16:00, выходной — Сб и Вск</p>
                      </div>
                    )}
                    {!isPickup && (
                      <div>
                        <label className="text-sm text-text-gray mb-1 block">Адрес доставки *</label>
                        <textarea value={form.address}
                          onChange={(e) => {
                            setForm({ ...form, address: e.target.value });
                            if (fieldErrors.address) setFieldErrors((prev) => { const n = { ...prev }; delete n.address; return n; });
                          }}
                          className={`w-full border ${fieldErrors.address ? "border-danger" : "border-border"} rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary`} rows={3} />
                        {fieldErrors.address && <p className="text-danger text-xs mt-1">{fieldErrors.address}</p>}
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-text-gray mb-1 block">Комментарий</label>
                      <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary" rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-3 border border-border rounded-lg hover:bg-bg-light text-text-dark font-medium">Назад</button>
                    <button onClick={() => {
                      if (validateForm()) setStep(3);
                    }} className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                      Далее — Подтверждение
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="bg-bg-white rounded-xl border border-border p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-text-dark mb-3 sm:mb-4">Подтверждение заказа</h2>
                  {error && <p className="text-danger text-sm mb-4">{error}</p>}
                  <div className="space-y-4">
                    <div className="p-4 bg-bg-light rounded-lg">
                      <h3 className="text-sm font-medium text-text-gray mb-2">Данные покупателя</h3>
                      <p className="text-sm text-text-dark">{form.name} {form.surname}</p>
                      <p className="text-sm text-text-dark">{form.phone}</p>
                      <p className="text-sm text-text-dark">{form.email}</p>
                      <p className="text-sm text-text-dark">{isPickup ? "Самовывоз" : form.address}</p>
                      {form.comment && <p className="text-sm text-text-gray mt-1">Комментарий: {form.comment}</p>}
                      <button onClick={() => setStep(2)} className="text-primary text-sm hover:underline mt-2">Изменить</button>
                    </div>
                    <div className="p-4 bg-bg-light rounded-lg">
                      <h3 className="text-sm font-medium text-text-gray mb-2">Товары ({items.length})</h3>
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.isPack}`} className="flex justify-between text-sm text-text-dark py-1">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</span>
                        </div>
                      ))}
                      <button onClick={() => setStep(1)} className="text-primary text-sm hover:underline mt-2">Изменить</button>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(2)} className="px-6 py-3 border border-border rounded-lg hover:bg-bg-light text-text-dark font-medium">Назад</button>
                    <button onClick={handleSubmit} disabled={loading || items.length === 0}
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50">
                      {loading ? "Оформляем..." : "Подтвердить заказ"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order summary sidebar */}
            <div>
              <div className="bg-bg-white rounded-xl border border-border p-6 sticky top-4">
                <h2 className="text-lg font-bold text-text-dark mb-4">Ваш заказ</h2>
                <div className="space-y-2 text-sm mb-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.isPack}`} className="flex justify-between text-text-gray">
                      <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0">{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Итого:</span>
                  <span className="text-primary">{total.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
