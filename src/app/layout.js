import "@/app/globals.css";

import Script from "next/script";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildSiteUrl, siteConfig, tools } from "@/lib/site";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Free Video Downloader, Audio Converter & Online Tools",
    template: "%s | Free2All"
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  category: "technology",
  applicationName: "Free2All",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Free2All" }],
  creator: "Free2All",
  publisher: "Free2All",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Free Video Downloader, Audio Converter & Online Tools | Free2All",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Free2All"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Downloader, Audio Converter & Online Tools | Free2All",
    description: siteConfig.description,
    images: ["/icon.svg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification
      }
    : undefined
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#040B18",
  colorScheme: "dark"
};

export default function RootLayout({ children }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    hasPart: tools.slice(0, 3).map((tool) => ({
      "@type": "WebPage",
      name: tool.title,
      url: buildSiteUrl(`/tools/${tool.slug}`)
    }))
  };

  return (
    <html lang="en">
      <body>
        <Script id="free2all-site-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [organizationSchema, websiteSchema]
          })}
        </Script>
        <div className="site-shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
