"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-bg-light">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-text-dark mb-6">Избранное</h1>
          <div className="bg-bg-white rounded-xl border border-border p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-text-gray mb-2">Раздел избранного временно недоступен</p>
            <p className="text-sm text-text-light mb-4">Добавляйте товары в корзину из каталога</p>
            <Link href="/catalog" className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Перейти в каталог</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
