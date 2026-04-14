import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/SectionHeading";
import { ToolCard } from "@/components/ToolCard";
import { ToolPageContent } from "@/components/ToolPageContent";
import { buildSiteUrl, getRelatedTools, getToolBySlug, siteConfig, tools } from "@/lib/site";

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {};
  }

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: [...tool.seoKeywords, ...tool.tags, ...tool.supported],
    alternates: {
      canonical: `/tools/${tool.slug}`
    },
    openGraph: {
      title: `${tool.seoTitle} | Free2All`,
      description: tool.seoDescription,
      url: buildSiteUrl(`/tools/${tool.slug}`),
      type: "website"
    },
    twitter: {
      title: `${tool.seoTitle} | Free2All`,
      description: tool.seoDescription
    }
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool.slug);
  const toolPageUrl = buildSiteUrl(`/tools/${tool.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: tool.seoTitle,
        url: toolPageUrl,
        description: tool.seoDescription,
        breadcrumb: {
          "@id": `${toolPageUrl}#breadcrumb`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${toolPageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: buildSiteUrl("/tools")
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.title,
            item: toolPageUrl
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        name: tool.title,
        applicationCategory: tool.category === "Media" ? "MultimediaApplication" : "UtilitiesApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        },
        featureList: [...tool.benefits, ...tool.supported],
        url: toolPageUrl
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faq.map((faq) => ({
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

  return (
    <>
      <Script id={`free2all-${tool.slug}-schema`} type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <section className="section">
        <div className="container tool-page-shell">
          <div className="tool-page-header">
            <p className="muted-copy">
              <Link href="/">Home</Link> / <Link href="/tools">Tools</Link> / {tool.title}
            </p>
            <span className="eyebrow">{tool.eyebrow}</span>
            <h1>{tool.title}</h1>
            <p>{tool.longDescription}</p>
          </div>

          <ToolPageContent slug={tool.slug} />
        </div>
      </section>

      <section className="section">
        <div className="container page-stack">
          <SectionHeading
            eyebrow="Why Use This Tool"
            title={`What ${tool.title.toLowerCase()} helps you do`}
            description={tool.seoDescription}
          />

          <div className="content-grid content-grid-three">
            {tool.benefits.map((benefit) => (
              <article className="glass-panel prose-card" key={benefit}>
                <h3>{tool.title}</h3>
                <p>{benefit}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container page-stack">
          <SectionHeading
            eyebrow="How To Use"
            title={`How to use the ${tool.title.toLowerCase()}`}
            description="Each Free2All tool keeps the path short so users can finish the task with less friction."
          />

          <article className="glass-panel prose-card">
            <div className="step-list">
              {tool.steps.map((step, index) => (
                <div className="step-item" key={step}>
                  <span className="step-index">0{index + 1}</span>
                  <div>
                    <strong>{step}</strong>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container page-stack">
          <SectionHeading
            eyebrow="FAQ"
            title={`Questions about the ${tool.title.toLowerCase()}`}
            description="Helpful answers improve the page for both visitors and search engines."
          />

          <div className="content-grid content-grid-two">
            {tool.faq.map((faq) => (
              <article className="glass-panel prose-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {relatedTools.length ? (
        <section className="section">
          <div className="container page-stack">
            <SectionHeading
              eyebrow="Related Tools"
              title="Keep moving with the next useful workflow"
              description="Internal links help users discover the next relevant tool without going back to search."
            />

            <div className="tool-grid">
              {relatedTools.map((relatedTool) => (
                <ToolCard key={relatedTool.slug} tool={relatedTool} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
