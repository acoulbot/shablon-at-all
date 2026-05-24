import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function HomePage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [slides, categories, featuredProducts, newProducts, saleProducts, reviews, totalProducts] = await Promise.all([
    prisma.sliderImage.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      take: 8,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: { category: true, reviews: { select: { rating: true } } },
    }),
    prisma.product.findMany({
      take: 4,
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: "desc" },
      include: { category: true, reviews: { select: { rating: true } } },
    }),
    prisma.product.findMany({
      take: 4,
      where: { oldPrice: { not: null } },
      orderBy: { updatedAt: "desc" },
      include: { category: true, reviews: { select: { rating: true } } },
    }),
    prisma.review.findMany({
      take: 6,
      where: { published: true, rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, lastName: true } }, product: { select: { name: true, slug: true } } },
    }),
    prisma.product.count(),
  ]);

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CloudStuff",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://cloudstuff.ru",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_BASE_URL || "https://cloudstuff.ru"}/catalog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <main className="flex-1">
        {/* Hero Slider */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <HeroSlider slides={slides} />
        </section>

        {/* Brand headline + CTA */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-text-dark via-[#3A3A3A] to-text-dark p-6 sm:p-10 md:p-14 text-center">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-rotate-slow" />
              </div>
              <div className="relative z-10">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-5">
                  <span className="bg-gradient-to-r from-primary-light via-white to-primary-light bg-clip-text text-transparent">CloudStuff</span>
                  <br />
                  <span className="text-white/90 text-xl sm:text-2xl md:text-3xl font-bold">Аксессуары для ваших устройств</span>
                </h1>
                <p className="text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
                  Pod-системы, картриджи, испарители и аксессуары от ведущих брендов. Качество и быстрая доставка по всей России.
                </p>
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
          </section>
        </ScrollReveal>

        {/* Stats bar */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 sm:pb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { value: `${totalProducts}+`, label: "Товаров в каталоге", icon: "📦" },
                { value: `${categories.length}`, label: "Категорий", icon: "🏷️" },
                { value: "24/7", label: "Поддержка клиентов", icon: "💬" },
                { value: "РФ", label: "Доставка по России", icon: "🚚" },
              ].map((stat) => (
                <div key={stat.label} className="bg-bg-white rounded-xl border border-border p-4 sm:p-5 text-center hover:shadow-lg transition-all hover-lift group">
                  <span className="text-2xl sm:text-3xl block mb-2 group-hover:scale-110 transition-transform">{stat.icon}</span>
                  <div className="text-xl sm:text-2xl font-extrabold font-heading text-text-dark mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-text-gray">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Categories — dynamic from DB */}
        {categories.length > 0 && (
          <ScrollReveal>
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="font-heading text-xl sm:text-3xl font-bold text-text-dark mb-2">Категории товаров</h2>
                <p className="text-text-gray text-sm sm:text-base">Выберите интересующий раздел</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {categories.map((cat, i) => (
                  <Link
                    key={cat.id}
                    href={`/catalog/${cat.slug}`}
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
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Sale products */}
        {saleProducts.length > 0 && (
          <ScrollReveal>
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
              <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-5 sm:p-8 border border-primary/20">
                <div className="flex items-center justify-between mb-5 sm:mb-7">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">🔥</span>
                    <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark">Акции и скидки</h2>
                  </div>
                  <Link href="/catalog?sort=price_asc" className="text-primary hover:underline text-xs sm:text-sm font-medium">
                    Все акции &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {saleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      description={product.description}
                      image={product.image}
                      categorySlug={product.category.slug}
                    />
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Featured products */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
            <div className="flex items-center justify-between mb-5 sm:mb-7">
              <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark">Популярные товары</h2>
              <Link href="/catalog" className="text-primary hover:underline text-xs sm:text-sm font-medium">Все товары &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  description={product.description}
                  image={product.image}
                  categorySlug={product.category.slug}
                />
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* New arrivals */}
        {newProducts.length > 0 && (
          <ScrollReveal>
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
              <div className="flex items-center justify-between mb-5 sm:mb-7">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">✨</span>
                  <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark">Новинки</h2>
                </div>
                <Link href="/catalog?sort=new" className="text-primary hover:underline text-xs sm:text-sm font-medium">Все новинки &rarr;</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {newProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    description={product.description}
                    image={product.image}
                    categorySlug={product.category.slug}
                  />
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Advantages banner */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
            <div className="bg-gradient-to-br from-bg-white to-primary/[0.04] rounded-2xl border border-border p-5 sm:p-8">
              <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark text-center mb-5 sm:mb-8">Почему CloudStuff?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { icon: "🚚", title: "Быстрая доставка", desc: "По всей России от 1 дня" },
                  { icon: "✅", title: "Оригинальная продукция", desc: "Гарантия подлинности товара" },
                  { icon: "💬", title: "Поддержка 24/7", desc: "Ответим на любые вопросы" },
                  { icon: "🔄", title: "Возврат 14 дней", desc: "Без лишних вопросов" },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className="text-center group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="text-3xl sm:text-4xl block mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-text-dark mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-text-gray leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Customer reviews */}
        {reviews.length > 0 && (
          <ScrollReveal>
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
              <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark mb-5 sm:mb-7 text-center">Отзывы покупателей</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-bg-white rounded-xl border border-border p-4 sm:p-5 hover:shadow-lg transition-all hover-lift">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {(review.user.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-dark">{review.user.name || "Покупатель"} {review.user.lastName?.[0] ? `${review.user.lastName[0]}.` : ""}</p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-accent fill-accent" : "text-gray-200 fill-gray-200"}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.text && <p className="text-sm text-text-gray line-clamp-3 mb-2">{review.text}</p>}
                    <Link href={`/product/${review.product.slug}`} className="text-xs text-primary hover:underline">{review.product.name}</Link>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* CTA bottom banner */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-primary-dark p-6 sm:p-10 text-center">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <h2 className="font-heading text-xl sm:text-3xl font-bold text-white mb-3">Не нашли нужный товар?</h2>
                <p className="text-white/80 text-sm sm:text-base mb-5 max-w-lg mx-auto">Свяжитесь с нами — подберём подходящий вариант или закажем специально для вас</p>
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
          </section>
        </ScrollReveal>

        {/* Age verification */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
          <div className="bg-text-dark/5 rounded-xl p-4 sm:p-5 text-center border border-border">
            <p className="text-xs sm:text-sm text-text-gray">Продукция предназначена для лиц старше 18 лет. Приобретая товары на сайте, вы подтверждаете своё совершеннолетие.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
