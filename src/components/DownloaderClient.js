"use client";

import { AlertCircle, CirclePlay, Clock3, Download, LoaderCircle } from "lucide-react";
import { startTransition, useState } from "react";

const sampleUrls = [
  {
    label: "Example Watch Page",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    label: "Example Short Clip",
    url: "https://www.tiktok.com/@creator/video/1234567890123456789"
  },
  {
    label: "Example Video Post",
    url: "https://www.facebook.com/watch/?v=1234567890"
  },
  {
    label: "Example Reel Link",
    url: "https://www.instagram.com/reel/Cx12345678/"
  }
];

const modeCopy = {
  video: {
    title: "Paste a supported link",
    description: "Get video and audio options from a wide range of supported media pages.",
    button: "Get Options"
  },
  audio: {
    title: "Paste a supported link",
    description: "Convert supported media pages into downloadable audio output.",
    button: "Convert to Audio"
  },
  thumbnail: {
    title: "Paste a supported link",
    description: "Fetch a preview thumbnail from supported media pages and download it instantly.",
    button: "Get Thumbnail"
  }
};

export function DownloaderClient({ mode = "video" }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [downloadState, setDownloadState] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setDownloadState(null);

    try {
      const endpoint = mode === "thumbnail" ? "/api/media/thumbnail" : "/api/media/extract";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          url,
          mode
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong while processing the link.");
      }

      startTransition(() => {
        setResult(payload.media);
      });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(item) {
    setError("");

    try {
      setDownloadState({
        id: item.id,
        status: "starting",
        phase: "starting",
        receivedBytes: 0,
        totalBytes: 0,
        percentage: 0,
        speedBytesPerSecond: 0,
        etaSeconds: null
      });

      if (item.kind === "image") {
        await downloadFileToBrowser({
          url: item.downloadUrl,
          item,
          fallbackTitle: result?.title,
          setDownloadState
        });
        return;
      }

      const startResponse = await fetch(item.downloadUrl, {
        method: "POST",
        cache: "no-store"
      });
      const startPayload = await startResponse.json().catch(() => null);

      if (!startResponse.ok) {
        throw new Error(startPayload?.error || "Download failed. Please try again.");
      }

      let job = startPayload;
      setDownloadState(mapJobToDownloadState(item.id, job));

      while (job.status !== "ready") {
        if (job.status === "error") {
          throw new Error(job.error || "Download failed. Please try again.");
        }

        await wait(500);

        const statusResponse = await fetch(buildJobUrl(item.downloadUrl, job.id, "status"), {
          cache: "no-store"
        });
        const statusPayload = await statusResponse.json().catch(() => null);

        if (!statusResponse.ok && !statusPayload?.status) {
          throw new Error(statusPayload?.error || "Unable to read the download progress.");
        }

        job = statusPayload;
        setDownloadState(mapJobToDownloadState(item.id, job));
      }

      await downloadFileToBrowser({
        url: buildJobUrl(item.downloadUrl, job.id),
        item,
        fallbackTitle: result?.title,
        setDownloadState
      });
    } catch (downloadError) {
      setDownloadState(null);
      setError(downloadError.message || "Download failed. Please try again.");
    }
  }

  const copy = modeCopy[mode];
  const isDownloadActive = Boolean(downloadState && downloadState.status !== "done");

  return (
    <div className="tool-shell">
      <form className="tool-form glass-panel" onSubmit={handleSubmit}>
        <div className="tool-form-header tool-form-header-compact">
          <div>
            <span className="eyebrow">Broad Extractor Support</span>
            <h3>{copy.title}</h3>
            <p>{copy.description} Some pages may still fail because of DRM, login walls, or site-side blocks.</p>
          </div>
        </div>

        <div className="input-row">
          <input
            id={`${mode}-url`}
            className="text-input"
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a supported URL here"
          />
          <button className="button button-primary" type="submit" disabled={loading || !url.trim()}>
            {loading ? <LoaderCircle className="spin" size={18} /> : <Download size={18} />}
            {copy.button}
          </button>
        </div>

        <div className="sample-links">
          {sampleUrls.map((sample) => (
            <button key={sample.label} type="button" className="chip chip-button" onClick={() => setUrl(sample.url)}>
              {sample.label}
            </button>
          ))}
        </div>
      </form>

      {loading ? (
        <div className="processing-card glass-panel" aria-live="polite">
          <div className="processing-visual">
            <span className="processing-ring" />
            <span className="processing-ring processing-ring-delayed" />
            <LoaderCircle className="spin" size={26} />
          </div>
          <div>
            <h3>Processing</h3>
            <p>Preparing your result.</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="status-card error glass-panel" role="alert">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      ) : null}

      {result ? (
        <section className="result-panel glass-panel">
          <div className="result-preview">
            <div className="thumbnail-shell">
              <img
                src={result.thumbnail}
                alt={`${result.title} preview`}
                loading="lazy"
                decoding="async"
                className="thumbnail-image"
              />
            </div>

            <div className="result-copy">
              <span className="eyebrow">Detected Source</span>
              <h3>{result.title}</h3>

              <div className="result-stats">
                <span className="pill">
                  <CirclePlay size={15} />
                  Source Ready
                </span>
                <span className="pill">
                  <Clock3 size={15} />
                  {result.duration}
                </span>
                <span className="pill">{result.estimatedSize}</span>
              </div>

              {result.downloads.length ? (
                <div className="download-grid">
                  {result.downloads.map((item) => {
                    const isCurrentDownload = downloadState?.id === item.id;
                    const progressLabel = getProgressLabel(downloadState);
                    const isCompletedDownload = isCurrentDownload && downloadState?.status === "done";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`download-option${isCurrentDownload ? " is-active" : ""}`}
                        onClick={() => handleDownload(item)}
                        disabled={isDownloadActive}
                      >
                        <div className="download-option-copy">
                          <strong>{item.label}</strong>
                          <span>
                            {isCurrentDownload ? progressLabel : `${item.quality} | ${item.size}`}
                          </span>
                          {isCurrentDownload ? (
                            <span className="download-progress-track" aria-hidden="true">
                              <span
                                className="download-progress-bar"
                                style={{ width: `${getProgressWidth(downloadState)}%` }}
                              />
                            </span>
                          ) : null}
                        </div>
                        {isCurrentDownload && !isCompletedDownload ? (
                          <LoaderCircle className="spin" size={18} />
                        ) : (
                          <Download size={18} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="status-card glass-panel">
                  <AlertCircle size={18} />
                  <p>{result.notice}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function formatDownloadBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function getProgressLabel(downloadState) {
  if (!downloadState) {
    return "";
  }

  if (downloadState.status === "done") {
    return "Download complete";
  }

  if (downloadState.phase === "starting" || downloadState.phase === "queued") {
    return "Starting download...";
  }

  if (downloadState.phase === "retrying") {
    return "Retrying connection for this source...";
  }

  if (downloadState.phase === "processing" || downloadState.phase === "ready") {
    return "Processing file on server...";
  }

  if (downloadState.phase === "saving") {
    if (downloadState.totalBytes > 0) {
      return `Saving file ${Math.round(downloadState.percentage)}% | ${formatDownloadBytes(downloadState.receivedBytes)} / ${formatDownloadBytes(downloadState.totalBytes)}`;
    }

    return `Saving file | ${formatDownloadBytes(downloadState.receivedBytes)}`;
  }

  const speed = downloadState.speedBytesPerSecond > 0 ? ` | ${formatSpeed(downloadState.speedBytesPerSecond)}` : "";
  const eta = Number.isFinite(downloadState.etaSeconds) && downloadState.etaSeconds > 0 ? ` | ETA ${formatEta(downloadState.etaSeconds)}` : "";

  if (downloadState.totalBytes > 0) {
    return `Downloading ${Math.round(downloadState.percentage)}% | ${formatDownloadBytes(downloadState.receivedBytes)} / ${formatDownloadBytes(downloadState.totalBytes)}${speed}${eta}`;
  }

  return `Downloading | ${formatDownloadBytes(downloadState.receivedBytes)}${speed}${eta}`;
}

function getProgressWidth(downloadState) {
  if (!downloadState) {
    return 0;
  }

  if (downloadState.totalBytes > 0) {
    return Math.max(Math.min(downloadState.percentage, 100), 4);
  }

  if (
    downloadState.phase === "processing" ||
    downloadState.phase === "ready" ||
    downloadState.phase === "saving"
  ) {
    return 100;
  }

  if (downloadState.phase === "retrying") {
    return 24;
  }

  return 18;
}

function formatSpeed(bytesPerSecond = 0) {
  return `${formatDownloadBytes(bytesPerSecond)}/s`;
}

function formatEta(seconds = 0) {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;

  if (minutes > 0) {
    return `${minutes}:${String(remainder).padStart(2, "0")}`;
  }

  return `${remainder}s`;
}

function mapJobToDownloadState(itemId, job) {
  return {
    id: itemId,
    status: job.status,
    phase: job.progress?.phase || job.status,
    receivedBytes: job.progress?.downloadedBytes || 0,
    totalBytes: job.progress?.totalBytes || 0,
    percentage: job.progress?.percentage || 0,
    speedBytesPerSecond: job.progress?.speedBytesPerSecond || 0,
    etaSeconds: job.progress?.etaSeconds ?? null
  };
}

function buildJobUrl(baseUrl, jobId, view) {
  const url = new URL(baseUrl, window.location.origin);

  url.searchParams.set("jobId", jobId);

  if (view) {
    url.searchParams.set("view", view);
  } else {
    url.searchParams.delete("view");
  }

  return url.toString();
}

async function downloadFileToBrowser({ url, item, fallbackTitle, setDownloadState }) {
  const response = await fetch(url, {
    cache: "no-store"
  });
  const contentType = response.headers.get("content-type") || "application/octet-stream";

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Download failed. Please try again.");
  }

  const contentLength = Number(response.headers.get("content-length")) || 0;
  const fallbackFilename = `${fallbackTitle || item.label}.${item.format}`;
  const filename = getFilenameFromHeaders(response.headers, fallbackFilename);

  if (!response.body) {
    const blob = await response.blob();
    triggerBrowserDownload(blob, filename);
    setDownloadState({
      id: item.id,
      status: "done",
      phase: "done",
      receivedBytes: blob.size,
      totalBytes: blob.size,
      percentage: 100,
      speedBytesPerSecond: 0,
      etaSeconds: 0
    });
    queueDownloadStateReset(setDownloadState, item.id);
    return;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let receivedBytes = 0;

  setDownloadState({
    id: item.id,
    status: "saving",
    phase: "saving",
    receivedBytes: 0,
    totalBytes: contentLength,
    percentage: 0,
    speedBytesPerSecond: 0,
    etaSeconds: null
  });

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedBytes += value.length;
    const percentage = contentLength ? Math.min((receivedBytes / contentLength) * 100, 100) : 0;

    setDownloadState({
      id: item.id,
      status: "saving",
      phase: "saving",
      receivedBytes,
      totalBytes: contentLength,
      percentage,
      speedBytesPerSecond: 0,
      etaSeconds: null
    });
  }

  const blob = new Blob(chunks, { type: contentType });
  triggerBrowserDownload(blob, filename);
  setDownloadState({
    id: item.id,
    status: "done",
    phase: "done",
    receivedBytes,
    totalBytes: contentLength || receivedBytes,
    percentage: 100,
    speedBytesPerSecond: 0,
    etaSeconds: 0
  });
  queueDownloadStateReset(setDownloadState, item.id);
}

function queueDownloadStateReset(setDownloadState, itemId) {
  window.setTimeout(() => {
    setDownloadState((current) => (current?.id === itemId ? null : current));
  }, 1800);
}

function wait(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function getFilenameFromHeaders(headers, fallback) {
  const disposition = headers.get("content-disposition") || "";
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = disposition.match(/filename="([^"]+)"/i);

  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  return fallback;
}

function triggerBrowserDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}
