"use client";

import { useDeferredValue, useState } from "react";

function getTextMetrics(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).length : 0;

  return {
    words,
    characters,
    charactersNoSpaces,
    paragraphs,
    readingMinutes: words ? Math.max(1, Math.ceil(words / 200)) : 0
  };
}

export function WordCounterClient() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  const metrics = getTextMetrics(deferredText);

  return (
    <div className="utility-shell">
      <div className="utility-panel glass-panel">
        <div className="tool-form-header tool-form-header-compact">
          <div>
            <span className="eyebrow">Writing Tool</span>
            <h3>Count words and characters</h3>
            <p>Paste text to see live writing metrics.</p>
          </div>
        </div>

        <textarea
          className="text-area"
          rows={12}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste or type your text here."
        />

        <div className="metric-grid">
          <article className="metric-card">
            <strong>{metrics.words}</strong>
            <span>Words</span>
          </article>
          <article className="metric-card">
            <strong>{metrics.characters}</strong>
            <span>Characters</span>
          </article>
          <article className="metric-card">
            <strong>{metrics.charactersNoSpaces}</strong>
            <span>No Spaces</span>
          </article>
          <article className="metric-card">
            <strong>{metrics.paragraphs}</strong>
            <span>Paragraphs</span>
          </article>
          <article className="metric-card">
            <strong>{metrics.readingMinutes}</strong>
            <span>Min Read</span>
          </article>
        </div>
      </div>
    </div>
  );
}
