import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getToolIcon } from "@/lib/icon-map";

export function ToolCard({ tool, featured = false }) {
  const Icon = getToolIcon(tool.icon);

  return (
    <Link href={`/tools/${tool.slug}`} className={`tool-card glass-panel ${featured ? "is-featured" : ""}`}>
      <div className="tool-card-top">
        <span className="tool-icon">
          <Icon size={22} />
        </span>
        {featured ? <span className="card-badge">Trending</span> : null}
      </div>

      <div className="tool-copy">
        <h3>{tool.title}</h3>
        <p>{tool.description}</p>
      </div>

      <span className="tool-link">
        Open tool
        <ArrowRight size={16} />
      </span>
    </Link>
  );
}
