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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://cloudstuff.ru"),
  verification: {
    google: "7xzsgxBohPMSWymk_1cwY1-vkYcinscTa3zkppOX5gA",
    yandex: "e39765df5b6abb49",
  },
  title: "CloudStuff — Аксессуары для электронных устройств и вейпов",
  description: "Интернет-магазин CloudStuff — чехлы, кейсы, зарядные устройства, кабели, powerbank, аксессуары для вейпов и электронных устройств. Доставка по России.",
  keywords: "аксессуары, чехлы, кейсы, зарядные устройства, кабели, powerbank, вейп аксессуары, CloudStuff, электронные устройства",
  openGraph: {
    title: "CloudStuff — Аксессуары для электронных устройств и вейпов",
    description: "Чехлы, кейсы, зарядные устройства, кабели, powerbank и аксессуары для вейпов. Доставка по России.",
    locale: "ru_RU",
    type: "website",
    siteName: "CloudStuff",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://cloudstuff.ru",
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://cloudstuff.ru";

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
              name: "CloudStuff",
              url: BASE_URL,
              logo: `${BASE_URL}/logo.svg`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+7-936-256-89-50",
                contactType: "customer service",
                areaServed: "RU",
                availableLanguage: "Russian",
              },
              sameAs: [
                "https://t.me/cloudstuff_ru",
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
              name: "CloudStuff",
              image: `${BASE_URL}/logo.svg`,
              url: BASE_URL,
              telephone: "+7-936-256-89-50",
              email: "info@cloudstuff.ru",
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
