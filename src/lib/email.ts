const SMTP_URL = process.env.SMTP_SERVICE_URL || "http://178.253.16.19:3003";
const SMTP_KEY = process.env.SMTP_API_KEY || "";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "noreply@cloudstuff.ru";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "s4810769@ya.ru";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch(`${SMTP_URL}/api/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SMTP_KEY}`,
    },
    body: JSON.stringify({ from_email: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("SMTP send error:", err);
    throw new Error("Ошибка отправки email");
  }
}

function wrapHtml(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7BA3B8; font-size: 24px; margin: 0;">CloudStuff</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Интернет-магазин</p>
      </div>
      <div style="background: white; border-radius: 8px; padding: 24px;">
        ${content}
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">&copy; CloudStuff &mdash; cloudstuff.ru</p>
    </div>
  `;
}

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  const html = wrapHtml(`
    <p style="color: #334155; font-size: 16px; margin-top: 0; text-align: center;">Ваш код подтверждения:</p>
    <div style="background: #f0f4f8; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a2332;">${code}</span>
    </div>
    <p style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 0;">Код действителен 10 минут.<br/>Если вы не запрашивали код, проигнорируйте это письмо.</p>
  `);
  await sendEmail(email, `Код подтверждения: ${code}`, html);
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export async function sendAdminNewOrder(
  orderId: string,
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  address: string,
  items: OrderItem[],
  total: number,
): Promise<void> {
  const itemsHtml = items.map((i) =>
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${i.price.toLocaleString("ru-RU")} ₽</td>
    </tr>`
  ).join("");

  const html = wrapHtml(`
    <h2 style="color: #334155; font-size: 18px; margin-top: 0;">Новый заказ #${orderId.slice(0, 8)}</h2>
    <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
      <tr><td style="color: #64748b; padding: 4px 0;">Клиент:</td><td style="padding: 4px 0;"><strong>${customerName}</strong></td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Телефон:</td><td style="padding: 4px 0;">${customerPhone}</td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Email:</td><td style="padding: 4px 0;">${customerEmail}</td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Адрес:</td><td style="padding: 4px 0;">${address}</td></tr>
    </table>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f0f4f8;">
          <th style="padding: 8px; text-align: left;">Товар</th>
          <th style="padding: 8px; text-align: center;">Кол-во</th>
          <th style="padding: 8px; text-align: right;">Цена</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="text-align: right; margin-top: 12px; font-size: 16px;">
      <strong>Итого: ${total.toLocaleString("ru-RU")} ₽</strong>
    </div>
  `);

  await sendEmail(ADMIN_EMAIL, `Новый заказ #${orderId.slice(0, 8)} — CloudStuff`, html);
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  processing: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export async function sendOrderStatusUpdate(
  email: string,
  orderId: string,
  status: string,
  trackNumber?: string,
  trackUrl?: string,
): Promise<void> {
  const label = STATUS_LABELS[status] || status;

  let trackingHtml = "";
  if (trackNumber) {
    const link = trackUrl
      ? `<a href="${trackUrl}" style="color: #7BA3B8; text-decoration: underline;">${trackNumber}</a>`
      : trackNumber;
    trackingHtml = `<p style="color: #334155; font-size: 14px;">Трек-номер: ${link}</p>`;
  }

  const html = wrapHtml(`
    <h2 style="color: #334155; font-size: 18px; margin-top: 0; text-align: center;">Обновление заказа</h2>
    <p style="color: #334155; font-size: 14px; text-align: center;">Заказ <strong>#${orderId.slice(0, 8)}</strong></p>
    <div style="background: #f0f4f8; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
      <span style="font-size: 20px; font-weight: bold; color: #7BA3B8;">Статус: ${label}</span>
    </div>
    ${trackingHtml}
    <p style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 0;">Если у вас есть вопросы, свяжитесь с нами в <a href="https://t.me/cloudstuff_ru" style="color: #7BA3B8;">Telegram</a>.</p>
  `);

  await sendEmail(email, `Заказ #${orderId.slice(0, 8)} — ${label}`, html);
}
