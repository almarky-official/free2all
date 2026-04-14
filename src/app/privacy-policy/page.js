import { buildSiteUrl } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description: "Read the Free2All privacy policy and how the app handles URLs, uploads, and generated outputs.",
  alternates: {
    canonical: "/privacy-policy"
  },
  openGraph: {
    title: "Free2All Privacy Policy",
    description: "Read the Free2All privacy policy and how the app handles URLs, uploads, and generated outputs.",
    url: buildSiteUrl("/privacy-policy"),
    type: "website"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <section className="section">
      <div className="container page-stack">
        <div className="section-heading">
          <span className="eyebrow">Privacy Policy</span>
          <h1>Privacy and responsible use</h1>
          <p>Free2All is designed to keep the user experience lightweight and transparent.</p>
        </div>

        <div className="content-grid content-grid-three">
          <article className="glass-panel prose-card">
            <h3>What data is processed</h3>
            <p>
              Media URLs submitted to downloader tools are used to validate the request and generate a preview response. Utility
              tools such as the word counter and password generator run locally in the browser whenever possible.
            </p>
          </article>

          <article className="glass-panel prose-card">
            <h3>Uploaded files</h3>
            <p>
              Files used with tools like the PDF merger are handled only to complete the requested action. This starter build does
              not include persistent user accounts or long-term storage for uploaded assets.
            </p>
          </article>

          <article className="glass-panel prose-card">
            <h3>Responsible use</h3>
            <p>
              Users should only download or process content they own or are permitted to access. Future production integrations
              should include logging, rate limiting, abuse protection, and provider-specific compliance checks.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
