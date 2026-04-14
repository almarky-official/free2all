import { SectionHeading } from "@/components/SectionHeading";
import { aboutFeatureGroups, aboutPrinciples, aboutSections, buildSiteUrl, workflowSteps } from "@/lib/site";

export const metadata = {
  title: "About",
  description: "Learn what Free2All is building and how the platform is designed to work.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: "About Free2All",
    description: "Learn what Free2All is building and how the platform is designed to work.",
    url: buildSiteUrl("/about"),
    type: "website"
  }
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container page-stack">
        <SectionHeading
          eyebrow="About Free2All"
          as="h1"
          title="A clean tools platform built for clarity, speed, and long-term growth"
          description="This page holds the deeper product context so the homepage and tool pages can stay focused."
        />

        <div className="content-grid content-grid-three">
          {aboutSections.map((section) => (
            <article className="glass-panel prose-card" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </article>
          ))}
        </div>

        <div className="content-grid content-grid-three">
          {aboutFeatureGroups.map((group) => (
            <article className="glass-panel prose-card" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </article>
          ))}
        </div>

        <div className="content-grid content-grid-two">
          <article className="glass-panel prose-card">
            <h3>How it works</h3>
            <div className="step-list">
              {workflowSteps.map((step, index) => (
                <div className="step-item" key={step.title}>
                  <span className="step-index">0{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel prose-card">
            <h3>What guides the product</h3>
            <ul className="simple-list">
              {aboutPrinciples.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="content-grid content-grid-two">
          <article className="glass-panel prose-card">
            <h3>Who it is for</h3>
            <p>
              Free2All is designed for students, creators, and everyday internet users who want useful tools without getting lost in
              cluttered pages or confusing flows.
            </p>
          </article>

          <article className="glass-panel prose-card">
            <h3>What comes next</h3>
            <p>
              The platform already uses modular routes and focused UI patterns, making it easier to add real provider integrations,
              storage, analytics, and stronger processing logic over time.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
