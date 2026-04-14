import Script from "next/script";

import { SectionHeading } from "@/components/SectionHeading";
import { ToolCard } from "@/components/ToolCard";
import { buildSiteUrl, siteConfig, tools } from "@/lib/site";

export const metadata = {
  title: "Video Downloader, Audio Converter & Tool Directory",
  description:
    "Browse the full Free2All directory of download tools, converters, and utility workflows including video, audio, thumbnail, PDF, image, and writing tools.",
  alternates: {
    canonical: "/tools"
  },
  openGraph: {
    title: "Video Downloader, Audio Converter & Tool Directory | Free2All",
    description:
      "Browse the full Free2All directory of download tools, converters, and utility workflows in one clean workspace.",
    url: buildSiteUrl("/tools"),
    type: "website"
  }
};

export default function ToolsPage() {
  const mediaTools = tools.filter((tool) => tool.category === "Media");
  const utilityTools = tools.filter((tool) => tool.category === "Utilities");

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free2All Tool Directory",
    url: buildSiteUrl("/tools"),
    description:
      "Browse the Free2All tool directory for video downloading, audio conversion, thumbnails, PDF utilities, image compression, and more.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.title,
        url: buildSiteUrl(`/tools/${tool.slug}`)
      }))
    }
  };

  return (
    <>
      <Script id="free2all-tools-schema" type="application/ld+json">
        {JSON.stringify(collectionSchema)}
      </Script>

      <section className="section">
        <div className="container page-stack">
          <SectionHeading
            eyebrow="All Tools"
            as="h1"
            title="Free video downloader, audio converter, and online utility tools"
            description="Browse the complete Free2All directory to open a focused workflow instead of searching through cluttered multi-purpose pages."
          />

          <div className="content-grid content-grid-two">
            <article className="glass-panel prose-card">
              <h3>Media workflows</h3>
              <p>
                Free2All includes dedicated pages for downloading videos, converting audio, and saving thumbnails from supported
                media pages.
              </p>
            </article>

            <article className="glass-panel prose-card">
              <h3>Everyday browser tools</h3>
              <p>
                The directory also includes practical tools for PDFs, images, password creation, and writing-related tasks that
                users often need quickly.
              </p>
            </article>
          </div>

          <div className="page-stack">
            <SectionHeading
              eyebrow="Media"
              title="Downloader and converter tools"
              description="Built for supported video pages, audio exports, and preview image workflows."
            />
            <div className="tool-grid">
              {mediaTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>

          <div className="page-stack">
            <SectionHeading
              eyebrow="Utilities"
              title="Practical online utility tools"
              description="Use simple browser workflows for PDFs, images, passwords, and writing tasks."
            />
            <div className="tool-grid">
              {utilityTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
