"use client";

import { EditableText } from "@/components/InlineEdit";

export function EditableAboutHero() {
  return (
    <div className="text-text-gray leading-relaxed space-y-4">
      <EditableText
        contentKey="about_hero_text"
        defaultValue="CloudStuff — современный интернет-магазин аксессуаров для электронных устройств и вейпов. Мы предлагаем широкий ассортимент чехлов, кейсов, зарядных устройств, кабелей, powerbank, защитных стёкол и вейп-аксессуаров — всё для ваших устройств в одном месте."
        as="p"
        className="text-lg text-text-dark"
        multiline
      />
      <EditableText
        contentKey="about_hero_text_2"
        defaultValue="Мы работаем только с проверенными брендами и поставщиками, гарантируя оригинальность каждого товара. Наша цель — предоставить клиенту удобный сервис с быстрой доставкой, честными ценами и профессиональной поддержкой. Мы постоянно расширяем ассортимент и предлагаем индивидуальные условия для оптовых покупателей."
        as="p"
        className=""
        multiline
      />
    </div>
  );
}

export function EditableValues() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {[
        { icon: "🎯", titleKey: "about_val_1_title", titleDef: "Наша цель", descKey: "about_val_1_desc", descDef: "Стать ведущей площадкой аксессуаров для электроники с лучшим ассортиментом и сервисом по честным ценам." },
        { icon: "🤝", titleKey: "about_val_2_title", titleDef: "Наш подход", descKey: "about_val_2_desc", descDef: "Только оригинальная продукция, быстрая доставка и профессиональная консультация по каждому товару." },
        { icon: "⭐", titleKey: "about_val_3_title", titleDef: "Наша особенность", descKey: "about_val_3_desc", descDef: "Широкий ассортимент от ведущих брендов и индивидуальные условия для оптовых партнёров." },
      ].map((item) => (
        <div key={item.titleKey} className="bg-bg-white rounded-xl border border-border p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">{item.icon}</span>
          </div>
          <EditableText contentKey={item.titleKey} defaultValue={item.titleDef} as="h3" className="font-bold text-text-dark mb-2" />
          <EditableText contentKey={item.descKey} defaultValue={item.descDef} as="p" className="text-sm text-text-gray" multiline />
        </div>
      ))}
    </div>
  );
}

export function EditableAboutText({ title, content }: { title?: string; content?: string }) {
  if (content) {
    return (
      <div className="bg-bg-white rounded-xl border border-border p-4 sm:p-6 md:p-8">
        <EditableText contentKey="about_section_title" defaultValue={title || "О нас"} as="h2" className="text-lg sm:text-xl font-bold text-text-dark mb-3 sm:mb-4" />
        <div className="text-text-gray leading-relaxed space-y-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className="bg-bg-white rounded-xl border border-border p-4 sm:p-6 md:p-8">
      <EditableText contentKey="about_section_title" defaultValue={title || "О нас"} as="h2" className="text-lg sm:text-xl font-bold text-text-dark mb-3 sm:mb-4" />
      <div className="text-text-gray leading-relaxed space-y-4">
        <EditableText
          contentKey="about_section_text_1"
          defaultValue="Наш ассортимент охватывает все ключевые категории электронных аксессуаров — от чехлов и защитных стёкол до зарядных устройств, кабелей и powerbank. Мы постоянно расширяем линейку и следим за новинками рынка."
          as="p"
          className=""
          multiline
        />
        <EditableText
          contentKey="about_section_text_2"
          defaultValue="Продажи ведутся через онлайн-платформу с удобной системой доставок/самовывозов и возможностью оптового сотрудничества."
          as="p"
          className=""
          multiline
        />
      </div>
    </div>
  );
}
