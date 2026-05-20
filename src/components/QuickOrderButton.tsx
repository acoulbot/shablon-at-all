"use client";

import { useState } from "react";
import { showToast } from "@/components/Toast";

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

interface QuickOrderButtonProps {
  productId: string;
  productName: string;
}

export default function QuickOrderButton({ productId, productName }: QuickOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) { setError("Введите имя"); return; }
    if (/\d/.test(name)) { setError("Имя — только буквы, без цифр"); return; }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits.startsWith("79") || phoneDigits.length !== 11) {
      setError("Формат телефона: +7 (9XX) XXX-XX-XX");
      return;
    }

    if (!email.trim() || !email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email с @");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quick-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), productId, productName }),
      });
      if (res.ok) {
        setDone(true);
        showToast("Заявка отправлена! Мы свяжемся с вами.");
        setTimeout(() => { setOpen(false); setDone(false); setName(""); setPhone(""); setEmail(""); }, 3000);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors text-sm"
      >
        Купить в 1 клик
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !loading && setOpen(false)}>
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-sm w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-text-dark">Быстрый заказ</h3>
              <button onClick={() => setOpen(false)} className="text-text-gray hover:text-text-dark">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-text-gray mb-4 line-clamp-2">{productName}</p>
            {done ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-success font-medium">Заявка принята!</p>
                <p className="text-sm text-text-gray">Мы свяжемся с вами в ближайшее время</p>
              </div>
            ) : (
              <>
                {error && <p className="text-danger text-xs mb-3">{error}</p>}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ""))}
                  placeholder="Имя (только буквы)"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 (9__) ___-__-__"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? "Отправка..." : "Оформить заказ"}
                </button>
                <p className="text-[10px] text-text-light text-center mt-2">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
