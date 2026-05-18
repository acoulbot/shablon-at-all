"use client";

import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  categorySlug: string;
}

export default function ProductCard({
  name,
  slug,
  description,
  image,
}: ProductCardProps) {
  return (
    <div className="bg-bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-300 p-3 sm:p-4 flex flex-col group">
      <Link href={`/product/${slug}`} className="block">
        <div className="relative aspect-square mb-2 sm:mb-3 bg-bg-light rounded-lg flex items-center justify-center overflow-hidden">
          {image ? (
            <Image src={image} alt={name} fill className="object-contain p-2 transition-transform duration-400 group-hover:scale-110" />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-light">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">Нет фото</span>
            </div>
          )}
        </div>
      </Link>

      <Link href={`/product/${slug}`} className="block">
        <h3 className="text-sm sm:text-base font-semibold text-text-dark leading-tight mb-1.5 line-clamp-2 hover:text-primary transition-colors">{name}</h3>
      </Link>

      {description && (
        <p className="text-xs sm:text-sm text-text-gray leading-relaxed line-clamp-3">{description}</p>
      )}
    </div>
  );
}
