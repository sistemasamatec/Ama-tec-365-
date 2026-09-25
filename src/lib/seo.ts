import { COMPANY } from '../content/company';
import { FAQItem, ServiceItem } from '../types';

export function getLocalBusinessJsonLd(customSettings?: any) {
  const brand = customSettings?.company?.brand || COMPANY.brand;
  const legalName = customSettings?.company?.legalName || COMPANY.legalName;
  const descriptor = customSettings?.company?.descriptor || COMPANY.descriptor;
  const address = customSettings?.company?.address || COMPANY.address;
  const city = customSettings?.company?.city || COMPANY.city;
  const country = customSettings?.company?.country || COMPANY.country;
  const phone = customSettings?.company?.phone || COMPANY.phone;
  const email = customSettings?.company?.email || COMPANY.email;
  const nif = customSettings?.company?.nif || COMPANY.nif;
  const siteUrl = customSettings?.company?.siteUrl || COMPANY.siteUrl;

  const lat = customSettings?.googleMaps?.coordinates?.lat || -8.8893;
  const lng = customSettings?.googleMaps?.coordinates?.lng || 13.2384;

  const sameAs: string[] = [];
  if (customSettings?.socialLinks) {
    for (const val of Object.values(customSettings.socialLinks)) {
      if (val && typeof val === 'string' && val.trim() && val.startsWith('http')) {
        sameAs.push(val.trim());
      }
    }
  }

  const base: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand,
    legalName,
    description: descriptor,
    url: siteUrl,
    telephone: phone,
    email,
    taxID: nif,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: city,
      addressCountry: country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    },
    priceRange: '$$',
    currenciesAccepted: 'AOA',
    paymentAccepted: 'Dinheiro, Transferência Multicaixa, Multicaixa Express',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '13:00',
      },
    ],
  };

  if (sameAs.length > 0) {
    base.sameAs = sameAs;
  }

  return base;
}

export function getServiceJsonLd(service: ServiceItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.name,
    name: service.name,
    description: service.shortDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: COMPANY.brand,
      telephone: COMPANY.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.address,
        addressLocality: COMPANY.city,
        addressCountry: COMPANY.country,
      },
    },
    areaServed: {
      '@type': 'City',
      name: 'Luanda',
    },
  };
}

export function getFAQJsonLd(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${COMPANY.siteUrl}${item.url}`,
    })),
  };
}

/**
 * Atualiza meta tags dinamicamente no documento HTML ao navegar
 */
export function updateDocumentSeo(params: {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
}) {
  if (typeof document === 'undefined') return;

  const fullTitle = `${params.title} | ${COMPANY.brand}`;
  document.title = fullTitle;

  // Meta description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', params.description);

  // Canonical
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  const canonicalUrl = `${COMPANY.siteUrl}${params.canonicalPath || window.location.pathname}`;
  canonicalLink.setAttribute('href', canonicalUrl);

  // Open Graph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);

  // Open Graph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', params.description);
}
