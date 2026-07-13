import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  EditableHero,
  SortableCategories,
  EditableAdvantages,
  EditableCTA,
  EditableAgeNotice,
} from "@/components/EditableSection";

export const revalidate = 60;

export default async function HomePage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [categories, featuredProducts, newProducts, saleProducts, reviews, totalProducts] = await Promise.all([
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
        {/* Brand headline + CTA */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
            <EditableHero />
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

        {/* Categories — dynamic from DB with drag-and-drop reorder */}
        {categories.length > 0 && (
          <ScrollReveal>
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="font-heading text-xl sm:text-3xl font-bold text-text-dark mb-2">Категории товаров</h2>
                <p className="text-text-gray text-sm sm:text-base">Выберите интересующий раздел</p>
              </div>
              <SortableCategories categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                icon: c.icon,
                _count: c._count,
              }))} />
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
            <EditableAdvantages />
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
            <EditableCTA />
          </section>
        </ScrollReveal>

        {/* Age verification */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
          <EditableAgeNotice />
        </section>
      </main>
      <Footer />
    </>
  );
}
