"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useState } from "react";

import { tools } from "@/lib/site";

function matchesQuery(tool, query) {
  const haystack = `${tool.title} ${tool.description} ${tool.tags.join(" ")} ${tool.supported.join(" ")}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function QuickToolSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const filteredTools = deferredQuery
    ? tools.filter((tool) => matchesQuery(tool, deferredQuery)).slice(0, 4)
    : tools.filter((tool) => tool.trending).slice(0, 4);
  const primaryTool = filteredTools[0];

  return (
    <div className="quick-search glass-panel">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          router.push(primaryTool ? `/tools/${primaryTool.slug}` : "/tools");
        }}
      >
        <label htmlFor="quick-tool-search" className="sr-only">
          Search Free2All tools
        </label>
        <div className="quick-search-row">
          <Search size={18} />
          <input
            id="quick-tool-search"
            type="search"
            value={query}
            onChange={(event) => {
              const nextValue = event.target.value;
              startTransition(() => {
                setQuery(nextValue);
              });
            }}
            placeholder="Search tools like audio converter, PDF merger, or word counter"
          />
          <button type="submit" className="button button-primary quick-search-submit">
            {primaryTool ? (deferredQuery ? "Open Tool" : "Browse") : "View Tools"}
          </button>
        </div>
      </form>

      <div className="quick-search-footer">
        <span className="quick-search-label">{deferredQuery ? "Top matches" : "Trending tools"}</span>
        <div className="quick-search-results">
          {filteredTools.length ? (
            filteredTools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="quick-search-item">
                <div>
                  <strong>{tool.title}</strong>
                  <span>{tool.description}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))
          ) : (
            <div className="quick-search-empty">No exact match found. Browse the full tools page instead.</div>
          )}
        </div>
      </div>
    </div>
  );
}
