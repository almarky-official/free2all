import Link from "next/link";

import { Free2AllLogo } from "@/components/Free2AllLogo";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-brand">
          <Free2AllLogo />
          <p className="muted-copy">{siteConfig.tagline}</p>
        </div>

        <div className="footer-links">
          {siteConfig.footerNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="footer-link">
              {item.label}
            </Link>
          ))}
        </div>

        <p className="footer-note">Use Free2All responsibly and only process content you are allowed to use.</p>
        <p className="footer-note">Developed by Subhan Studio</p>
      </div>
    </footer>
  );
}
