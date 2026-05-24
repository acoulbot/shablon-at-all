import { NextRequest, NextResponse } from "next/server";
import { sendVerificationCode } from "@/lib/email";

interface PendingCode {
  code: string;
  expiresAt: number;
}

const pendingCodes = new Map<string, PendingCode>();

function cleanExpired() {
  const now = Date.now();
  for (const [key, val] of pendingCodes) {
    if (val.expiresAt < now) pendingCodes.delete(key);
  }
}

export async function POST(req: NextRequest) {
  const { email, code } = await req.json() as { email?: string; code?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (code) {
    const pending = pendingCodes.get(normalizedEmail);
    if (!pending) {
      return NextResponse.json({ error: "Код не найден, запросите новый" }, { status: 400 });
    }
    if (Date.now() > pending.expiresAt) {
      pendingCodes.delete(normalizedEmail);
      return NextResponse.json({ error: "Код истёк, запросите новый" }, { status: 400 });
    }
    if (pending.code !== code.trim()) {
      return NextResponse.json({ error: "Неверный код" }, { status: 400 });
    }
    pendingCodes.delete(normalizedEmail);
    return NextResponse.json({ verified: true });
  }

  cleanExpired();

  const existing = pendingCodes.get(normalizedEmail);
  if (existing && existing.expiresAt - 9 * 60 * 1000 > Date.now()) {
    return NextResponse.json({ error: "Код уже отправлен, подождите минуту" }, { status: 429 });
  }

  const newCode = String(Math.floor(100000 + Math.random() * 900000));
  pendingCodes.set(normalizedEmail, { code: newCode, expiresAt: Date.now() + 10 * 60 * 1000 });

  try {
    await sendVerificationCode(normalizedEmail, newCode);
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Email verification send error:", err);
    pendingCodes.delete(normalizedEmail);
    return NextResponse.json({ error: "Ошибка отправки кода. Попробуйте позже." }, { status: 500 });
  }
}
