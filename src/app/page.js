import Link from "next/link";
import Script from "next/script";
import { ArrowRight } from "lucide-react";

import { QuickToolSearch } from "@/components/QuickToolSearch";
import { SectionHeading } from "@/components/SectionHeading";
import { ToolCard } from "@/components/ToolCard";
import { buildSiteUrl, homeFaqs, homeHighlights, siteConfig, tools, trendingTools } from "@/lib/site";

export const metadata = {
  title: "Free Video Downloader, Audio Converter & Online Tools",
  description:
    "Use Free2All for video downloads, audio conversion, thumbnail saving, and everyday online tools in one clean browser workflow.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Free Video Downloader, Audio Converter & Online Tools | Free2All",
    description:
      "Download videos, convert audio, save thumbnails, and use practical browser tools from one fast Free2All workspace.",
    url: siteConfig.url,
    type: "website"
  },
  twitter: {
    title: "Free Video Downloader, Audio Converter & Online Tools | Free2All",
    description:
      "Download videos, convert audio, save thumbnails, and use practical browser tools from one fast Free2All workspace."
  }
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Free Video Downloader, Audio Converter & Online Tools",
      url: siteConfig.url,
      description:
        "Use Free2All for video downloads, audio conversion, thumbnail saving, and everyday online tools in one clean browser workflow."
    },
    {
      "@type": "WebApplication",
      name: siteConfig.name,
      description: siteConfig.description,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      featureList: tools.map((tool) => tool.title),
      url: siteConfig.url
    },
    {
      "@type": "ItemList",
      name: "Top Free2All tools",
      itemListElement: trendingTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.title,
        url: buildSiteUrl(`/tools/${tool.slug}`)
      }))
    },
    {
      "@type": "FAQPage",
      mainEntity: homeFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <Script id="free2all-home-schema" type="application/ld+json">
        {JSON.stringify(webAppSchema)}
      </Script>

      <section className="section hero-section">
        <div className="container hero-stack">
          <div className="hero-copy hero-copy-centered">
            <span className="eyebrow">Free Video Downloader + Online Tools</span>
            <h1>Free video downloader, audio converter, and everyday online tools in one place.</h1>
            <p className="hero-description">
              Free2All helps users download videos, convert audio, save thumbnails, merge PDFs, compress images, and handle quick
              online tasks from one clean workspace.
            </p>
          </div>

          <div className="hero-search-shell">
            <QuickToolSearch />
          </div>

          <div className="hero-actions hero-actions-centered">
            <Link href="/tools/video-downloader" className="button button-primary">
              Open Video Downloader
              <ArrowRight size={18} />
            </Link>
            <Link href="/tools" className="button button-secondary">
              Browse All Tools
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Popular Workflows"
            title="Start with the tools people search for first"
            description="The homepage is built around the most common Free2All workflows, especially video downloading and audio conversion."
            align="center"
          />
          <div className="tool-grid">
            {trendingTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} featured />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container page-stack">
          <SectionHeading
            eyebrow="Why Free2All"
            title="A people-first toolkit for downloads and online tasks"
            description="Useful search visibility starts with useful pages, so Free2All explains what each tool does and keeps the workflow clear."
          />

          <div className="content-grid content-grid-three">
            {homeHighlights.map((item) => (
              <article className="glass-panel prose-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container page-stack">
          <SectionHeading
            eyebrow="Main Categories"
            title="Choose a focused tool instead of searching through clutter"
            description="Free2All groups media workflows and utility tools into dedicated pages so users can reach the exact task faster."
          />

          <div className="content-grid content-grid-two">
            <article className="glass-panel prose-card">
              <h3>Media tools</h3>
              <p>
                Start with the <Link href="/tools/video-downloader">video downloader</Link>,{" "}
                <Link href="/tools/audio-converter">audio converter</Link>, or{" "}
                <Link href="/tools/thumbnail-downloader">thumbnail downloader</Link> when you need to work from supported media pages.
              </p>
            </article>

            <article className="glass-panel prose-card">
              <h3>Utility tools</h3>
              <p>
                Use focused utilities such as the <Link href="/tools/image-compressor">image compressor</Link>,{" "}
                <Link href="/tools/pdf-merger">PDF merger</Link>, <Link href="/tools/password-generator">password generator</Link>, and{" "}
                <Link href="/tools/word-counter">word counter</Link> for quick everyday tasks.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container page-stack">
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Common questions about Free2All"
            description="These answers help users understand what the site covers before they open a specific tool."
          />

          <div className="content-grid content-grid-two">
            {homeFaqs.map((faq) => (
              <article className="glass-panel prose-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-strip glass-panel">
            <div>
              <span className="eyebrow">Explore The Full Directory</span>
              <h2>Need more than the homepage tools?</h2>
              <p>Browse the full Free2All directory for download workflows, file tools, and quick browser utilities.</p>
            </div>
            <Link href="/tools" className="button button-secondary">
              View All {tools.length} Tools
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
