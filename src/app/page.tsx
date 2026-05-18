import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import CategoryGrid from "@/components/CategoryGrid";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function HomePage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [slides, categories, featuredProducts, newProducts, saleProducts, reviews] = await Promise.all([
    prisma.sliderImage.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } }, _count: { select: { products: true } } },
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

        {/* H1 + brand offer */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 pt-2 sm:pt-4 pb-4 sm:pb-6">
          <div className="bg-gradient-to-br from-bg-white via-primary/[0.03] to-primary/[0.08] rounded-2xl border border-border p-5 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-dark leading-tight mb-3 sm:mb-4 relative">
              <span className="gradient-text">CloudStuff</span> — аксессуары<br className="hidden sm:block" /> для ваших устройств
            </h1>
            <p className="text-text-gray text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-5 sm:mb-6 leading-relaxed relative">
              Чехлы, кейсы, зарядные устройства, кабели, <strong className="text-text-dark">Powerbank</strong>, аксессуары для вейпов и электронных устройств. Качество с доставкой по России.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
              <Link href="/catalog" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-all text-sm sm:text-base shadow-md hover:shadow-lg hover:shadow-primary/25 animate-glow-pulse">
                Перейти в каталог
              </Link>
              <Link href="/wholesale" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-8 py-3 rounded-xl transition-all text-sm sm:text-base">
                Оптовым клиентам
              </Link>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              {[
                { icon: "🚚", title: "Быстрая доставка", desc: "По всей России" },
                { icon: "✅", title: "Оригинальная продукция", desc: "Гарантия качества" },
                { icon: "💬", title: "Поддержка 24/7", desc: "Ответим на любые вопросы" },
                { icon: "🔄", title: "Возврат 14 дней", desc: "Без лишних вопросов" },
              ].map((item) => (
                <div key={item.title} className="bg-bg-white rounded-xl border border-border p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3 hover:shadow-md transition-shadow hover-lift">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-text-dark">{item.title}</h3>
                    <p className="text-[10px] sm:text-xs text-text-gray mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Categories */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark">Категории товаров</h2>
              <Link href="/catalog" className="text-primary hover:underline text-xs sm:text-sm">Все категории &rarr;</Link>
            </div>
            <CategoryGrid categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, children: c.children.map(ch => ({ id: ch.id, name: ch.name, slug: ch.slug, icon: ch.icon })), _count: c._count }))} />
          </section>
        </ScrollReveal>

        {/* Sale products */}
        {saleProducts.length > 0 && (
          <ScrollReveal>
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 sm:p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">🔥</span>
                    <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark">Акции и скидки</h2>
                  </div>
                  <Link href="/catalog?sort=price_asc" className="text-primary hover:underline text-xs sm:text-sm font-medium">Все акции &rarr;</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
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
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark">Популярные товары</h2>
              <Link href="/catalog" className="text-primary hover:underline text-xs sm:text-sm">Все товары &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
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
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">✨</span>
                  <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark">Новинки</h2>
                </div>
                <Link href="/catalog?sort=new" className="text-primary hover:underline text-xs sm:text-sm">Все новинки &rarr;</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
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

        {/* Customer reviews */}
        {reviews.length > 0 && (
          <ScrollReveal>
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-6 sm:pb-10">
              <h2 className="font-heading text-lg sm:text-2xl font-bold text-text-dark mb-4 sm:mb-6 text-center">Отзывы покупателей</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-bg-white rounded-xl border border-border p-4 sm:p-5 hover:shadow-md transition-shadow hover-lift">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {(review.user.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-dark">{review.user.name || "Покупатель"} {review.user.lastName?.[0] ? `${review.user.lastName[0]}.` : ""}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-3 h-3 ${s <= review.rating ? "text-accent fill-accent" : "text-gray-200 fill-gray-200"}`} viewBox="0 0 20 20">
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

        {/* Age verification banner */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 sm:pb-10">
          <div className="bg-text-dark/5 rounded-xl p-4 sm:p-6 text-center border border-border">
            <p className="text-sm text-text-gray">Продукция предназначена для лиц старше 18 лет. Приобретая товары на сайте, вы подтверждаете своё совершеннолетие.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
