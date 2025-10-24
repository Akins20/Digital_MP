/**
 * SEO Component
 * Manage meta tags and structured data for better SEO
 */

import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: {
    amount: number;
    currency: string;
  };
  availability?: 'in stock' | 'out of stock';
}

export default function SEO({
  title,
  description,
  keywords = [],
  ogImage,
  ogType = 'website',
  canonicalUrl,
  author,
  publishedTime,
  modifiedTime,
  price,
  availability,
}: SEOProps) {
  const siteName = 'Digital Marketplace';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Buy and sell high-quality digital products including templates, graphics, courses, and more on our secure marketplace.';
  const desc = description || defaultDescription;
  const defaultOgImage = `${siteUrl}/og-image.jpg`;
  const ogImg = ogImage || defaultOgImage;
  const canonical = canonicalUrl || siteUrl;

  // Generate structured data
  const generateStructuredData = () => {
    const baseData: any = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: desc,
    };

    if (ogType === 'product' && price) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description: desc,
        image: ogImg,
        offers: {
          '@type': 'Offer',
          price: price.amount,
          priceCurrency: price.currency,
          availability: availability === 'in stock'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
        ...(author && { brand: { '@type': 'Brand', name: author } }),
      };
    }

    if (ogType === 'article') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: desc,
        image: ogImg,
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author: author ? { '@type': 'Person', name: author } : undefined,
      };
    }

    return baseData;
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImg} />

      {/* Article Meta (if article type) */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Product Meta (if product type) */}
      {ogType === 'product' && price && (
        <>
          <meta property="product:price:amount" content={String(price.amount)} />
          <meta property="product:price:currency" content={price.currency} />
        </>
      )}

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#007AFF" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />
    </Head>
  );
}
