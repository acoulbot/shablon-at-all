"use client";

import { useInlineEdit, EditableText, SortableList } from "@/components/InlineEdit";
import Link from "next/link";
import type { ReactNode } from "react";

/* ─── Editable Hero Block ─── */

export function EditableHero() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-text-dark via-[#3A3A3A] to-text-dark p-6 sm:p-10 md:p-14 text-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-rotate-slow" />
      </div>
      <div className="relative z-10">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-5">
          <span className="bg-gradient-to-r from-primary-light via-white to-primary-light bg-clip-text text-transparent">
            <EditableText contentKey="hero_title" defaultValue="CloudStuff" as="span" className="" />
          </span>
          <br />
          <EditableText contentKey="hero_subtitle" defaultValue="Аксессуары для ваших устройств" as="span" className="text-white/90 text-xl sm:text-2xl md:text-3xl font-bold" />
        </h1>
        <EditableText contentKey="hero_description" defaultValue="Pod-системы, картриджи, испарители и аксессуары от ведущих брендов. Качество и быстрая доставка по всей России." as="p" className="text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed" multiline />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href="/catalog" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold px-10 py-3.5 rounded-xl transition-all text-sm sm:text-base shadow-lg hover:shadow-xl hover:shadow-primary/30 animate-glow-pulse hover:-translate-y-0.5">
            Перейти в каталог
          </Link>
          <Link href="/wholesale" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 font-bold px-10 py-3.5 rounded-xl transition-all text-sm sm:text-base hover:-translate-y-0.5">
            Оптовым клиентам
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Sortable Categories ─── */

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  _count: { products: number };
}

export function SortableCategories({ categories }: { categories: CategoryItem[] }) {
  const { editing, token } = useInlineEdit();

  const handleReorder = async (orderedIds: string[]) => {
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderedIds }),
    });
  };

  return (
    <SortableList
      items={categories}
      onReorder={handleReorder}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      renderItem={(cat, i) => (
        <Link
          key={cat.id}
          href={editing ? "#" : `/catalog/${cat.slug}`}
          onClick={editing ? (e) => e.preventDefault() : undefined}
          className="group bg-bg-white rounded-xl border border-border p-4 sm:p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all hover-lift"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span className="text-3xl sm:text-4xl block mb-3 group-hover:scale-110 transition-transform">
            {cat.icon && !(cat.icon.startsWith("/") || cat.icon.startsWith("http")) ? cat.icon : "📦"}
          </span>
          <h3 className="font-heading text-sm sm:text-base font-bold text-text-dark group-hover:text-primary transition-colors mb-1">
            {cat.name}
          </h3>
          <span className="text-xs text-text-gray">{cat._count.products} товаров</span>
        </Link>
      )}
    />
  );
}

/* ─── Sortable Slider ─── */

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  order: number;
  active: boolean;
}

export function SortableSlider({ slides, children }: { slides: SlideItem[]; children: ReactNode }) {
  const { editing, token } = useInlineEdit();

  if (!editing) return <>{children}</>;

  const handleReorder = async (orderedIds: string[]) => {
    await fetch("/api/admin/slider", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderedIds }),
    });
  };

  return (
    <div>
      <p className="text-xs text-primary font-medium mb-2 text-center">Перетаскивайте слайды для изменения порядка</p>
      <SortableList
        items={slides}
        onReorder={handleReorder}
        className="flex gap-3 overflow-x-auto pb-2"
        renderItem={(slide) => (
          <div className="flex-shrink-0 w-48 rounded-lg overflow-hidden border border-border bg-bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageUrl.startsWith("/") ? `/api/static${slide.imageUrl}` : slide.imageUrl} alt={slide.title || "Slide"} className="w-full h-24 object-cover" />
            <div className="p-2 text-xs">
              <p className="font-medium text-text-dark truncate">{slide.title || "Без заголовка"}</p>
              <p className="text-text-gray truncate">{slide.subtitle || "—"}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}

/* ─── Editable Advantages ─── */

export function EditableAdvantages() {
  return (
    <div className="bg-gradient-to-br from-bg-white to-primary/[0.04] rounded-2xl border border-border p-5 sm:p-8">
      <EditableText contentKey="advantages_title" defaultValue="Почему CloudStuff?" as="h2" className="font-heading text-lg sm:text-2xl font-bold text-text-dark text-center mb-5 sm:mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: "🚚", titleKey: "adv_1_title", titleDef: "Быстрая доставка", descKey: "adv_1_desc", descDef: "По всей России от 1 дня" },
          { icon: "✅", titleKey: "adv_2_title", titleDef: "Оригинальная продукция", descKey: "adv_2_desc", descDef: "Гарантия подлинности товара" },
          { icon: "💬", titleKey: "adv_3_title", titleDef: "Поддержка 24/7", descKey: "adv_3_desc", descDef: "Ответим на любые вопросы" },
          { icon: "🔄", titleKey: "adv_4_title", titleDef: "Возврат 14 дней", descKey: "adv_4_desc", descDef: "Без лишних вопросов" },
        ].map((item, i) => (
          <div key={item.titleKey} className="text-center group" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="text-3xl sm:text-4xl block mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
            <EditableText contentKey={item.titleKey} defaultValue={item.titleDef} as="h3" className="font-heading text-sm sm:text-base font-bold text-text-dark mb-1" />
            <EditableText contentKey={item.descKey} defaultValue={item.descDef} as="p" className="text-xs sm:text-sm text-text-gray leading-relaxed" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Editable CTA Banner ─── */

export function EditableCTA() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-primary-dark p-6 sm:p-10 text-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>
      <div className="relative z-10">
        <EditableText contentKey="cta_title" defaultValue="Не нашли нужный товар?" as="h2" className="font-heading text-xl sm:text-3xl font-bold text-white mb-3" />
        <EditableText contentKey="cta_description" defaultValue="Свяжитесь с нами — подберём подходящий вариант или закажем специально для вас" as="p" className="text-white/80 text-sm sm:text-base mb-5 max-w-lg mx-auto" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="https://t.me/cloudstuff_ru" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-white text-primary font-bold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base">
            Написать в Telegram
          </a>
          <Link href="/catalog" className="w-full sm:w-auto border-2 border-white/40 text-white font-bold px-8 py-3 rounded-xl transition-all hover:bg-white/10 hover:-translate-y-0.5 text-sm sm:text-base">
            Смотреть каталог
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Editable Age Notice ─── */

export function EditableAgeNotice() {
  return (
    <div className="bg-text-dark/5 rounded-xl p-4 sm:p-5 text-center border border-border">
      <EditableText contentKey="age_notice" defaultValue="Продукция предназначена для лиц старше 18 лет. Приобретая товары на сайте, вы подтверждаете своё совершеннолетие." as="p" className="text-xs sm:text-sm text-text-gray" />
    </div>
  );
}
