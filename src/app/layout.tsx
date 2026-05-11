import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://vapelabhit.ru"),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
  },
  title: "VapeLabHIT — Испарители, картриджи, аккумуляторы и аксессуары для вейпа",
  description: "Интернет-магазин VapeLabHIT — испарители, картриджи для вейпа, аккумуляторы, зарядные устройства, powerbank Walker, шнуры и вата. Доставка по России.",
  keywords: "вейп, испарители, картриджи, аккумуляторы, батарейки, зарядные устройства, powerbank Walker, вата, VapeLabHIT, вейп-шоп",
  openGraph: {
    title: "VapeLabHIT — Испарители, картриджи, аккумуляторы и аксессуары для вейпа",
    description: "Испарители, картриджи для вейпа, аккумуляторы и батарейки, зарядные устройства, powerbank Walker, шнуры и вата. Доставка по России.",
    locale: "ru_RU",
    type: "website",
    siteName: "VapeLabHIT",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://vapelabhit.ru",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://vapelabhit.ru";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`h-full antialiased ${inter.variable} ${manrope.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}')` }} />
          </>
        )}
        {process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID && (
          <>
            <script dangerouslySetInnerHTML={{ __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID}','ym');ym(${process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true})` }} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID && (
          <noscript>
            <div><img src={`https://mc.yandex.ru/watch/${process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div>
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "VapeLabHIT",
              url: BASE_URL,
              logo: `${BASE_URL}/logo.jpg`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+7-XXX-XXX-XX-XX",
                contactType: "customer service",
                areaServed: "RU",
                availableLanguage: "Russian",
              },
              sameAs: [
                "https://t.me/vapelabhit",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "VapeLabHIT",
              image: `${BASE_URL}/logo.jpg`,
              url: BASE_URL,
              telephone: "+7-XXX-XXX-XX-XX",
              email: "info@vapelabhit.ru",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Москва",
                addressCountry: "RU",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                opens: "10:00",
                closes: "22:00",
              },
              priceRange: "₽₽",
            }),
          }}
        />
        {children}
        <ClientShell />
      </body>
    </html>
  );
}
