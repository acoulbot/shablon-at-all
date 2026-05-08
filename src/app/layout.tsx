import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import { getSettings } from "@/lib/settings";
import SchemaOrg from "@/components/SchemaOrg";

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

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.ogTitle || `${s.siteName} — ${s.siteDescription}`;
  const description = s.ogDescription || s.siteDescription;

  return {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
    },
    title,
    description,
    keywords: s.siteKeywords,
    openGraph: {
      title,
      description,
      locale: "ru_RU",
      type: "website",
      siteName: s.siteName,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: s.faviconUrl || "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA;

  return (
    <html lang="ru" className={`h-full antialiased ${inter.variable} ${manrope.variable}`}>
      <head>
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}')` }} />
          </>
        )}
        {ymId && (
          <>
            <script dangerouslySetInnerHTML={{ __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${ymId}','ym');ym(${ymId},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true})` }} />
          </>
        )}
        {settings.colorPrimary !== "#e94560" && (
          <style dangerouslySetInnerHTML={{ __html: `:root{--color-primary:${settings.colorPrimary};--color-accent:${settings.colorAccent};--color-danger:${settings.colorDanger};--color-success:${settings.colorSuccess};--color-bg-light:${settings.colorBgLight};}` }} />
        )}
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {ymId && (
          <noscript>
            <div><img src={`https://mc.yandex.ru/watch/${ymId}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div>
          </noscript>
        )}
        <SchemaOrg settings={settings} />
        {children}
        <ClientShell />
      </body>
    </html>
  );
}
