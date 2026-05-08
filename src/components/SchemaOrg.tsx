import type { Settings } from "@/lib/settings";

export default function SchemaOrg({ settings }: { settings: Settings }) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    ...(settings.logoUrl && { logo: settings.logoUrl }),
    ...(settings.phone && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: settings.phone,
        contactType: "customer service",
        areaServed: "RU",
        availableLanguage: "Russian",
      },
    }),
    sameAs: [settings.socialTelegram, settings.socialVk, settings.socialWhatsapp].filter(Boolean),
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.siteName,
    ...(settings.logoUrl && { image: settings.logoUrl }),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    ...(settings.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressCountry: "RU",
      },
    }),
    priceRange: "₽₽",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
    </>
  );
}
