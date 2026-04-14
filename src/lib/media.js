import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";

import ffmpegPath from "ffmpeg-static";
import { z } from "zod";

import { formatBytes } from "@/lib/utils";

const supportedPlatforms = {
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"],
  facebook: ["facebook.com", "www.facebook.com", "fb.watch"],
  instagram: ["instagram.com", "www.instagram.com"]
};

const platformLabels = {
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
  instagram: "Instagram"
};

const genericSourceLabel = "Source Link";

const ytDlpBinary = process.env.YT_DLP_PATH || (process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
const mediaProxyUrl =
  process.env.FREE2ALL_MEDIA_PROXY_URL?.trim() ||
  process.env.HTTPS_PROXY?.trim() ||
  process.env.HTTP_PROXY?.trim() ||
  process.env.ALL_PROXY?.trim() ||
  "";
const mediaProxyMode = (process.env.FREE2ALL_MEDIA_PROXY_MODE || "blocked-only").trim().toLowerCase();
const downloadJobs = globalThis.__free2allDownloadJobs || new Map();
const downloadJobTimeouts = globalThis.__free2allDownloadJobTimeouts || new Map();
const JOB_TTL_MS = 15 * 60 * 1000;

globalThis.__free2allDownloadJobs = downloadJobs;
globalThis.__free2allDownloadJobTimeouts = downloadJobTimeouts;

const extractionSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Paste a video link to continue.")
    .refine((value) => {
      try {
        const parsedUrl = new URL(value);
        return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
      } catch {
        return false;
      }
    }, "Enter a valid URL.")
});

export function validateUrlPayload(payload) {
  return extractionSchema.parse(payload);
}

export function detectPlatform(urlValue) {
  const hostname = new URL(urlValue).hostname.toLowerCase();

  return Object.entries(supportedPlatforms).find(([, hosts]) =>
    hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  )?.[0];
}

function normalizePlatform(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("youtube")) {
    return "youtube";
  }

  if (normalized.includes("tiktok")) {
    return "tiktok";
  }

  if (normalized.includes("facebook") || normalized.includes("meta")) {
    return "facebook";
  }

  if (normalized.includes("instagram")) {
    return "instagram";
  }

  return null;
}

function getYoutubeId(urlValue) {
  try {
    const parsedUrl = new URL(urlValue);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1);
    }

    if (parsedUrl.searchParams.get("v")) {
      return parsedUrl.searchParams.get("v");
    }

    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    return segments.at(-1) || null;
  } catch {
    return null;
  }
}

function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function sanitizeFilename(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildFilename(title, extension) {
  const safeTitle = sanitizeFilename(title || "free2all-download") || "free2all-download";
  return `${safeTitle}.${extension}`;
}

export function buildDownloadUrl({ sourceUrl, title, format, quality, variant = "media", thumbnailUrl }) {
  const params = new URLSearchParams({
    sourceUrl,
    title,
    format,
    variant
  });

  if (quality) {
    params.set("quality", quality);
  }

  if (thumbnailUrl) {
    params.set("thumbnailUrl", thumbnailUrl);
  }

  return `/api/media/download?${params.toString()}`;
}

export function createThumbnailForUrl(sourceUrl, platform, title) {
  const resolvedPlatform = platform || detectPlatform(sourceUrl);

  if (resolvedPlatform === "youtube") {
    const youtubeId = getYoutubeId(sourceUrl);

    if (youtubeId) {
      return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    }
  }

  const palette = {
    youtube: ["#FF4D6D", "#7A0F2F"],
    tiktok: ["#30E3FF", "#0F172A"],
    facebook: ["#5B8CFF", "#132D5C"],
    instagram: ["#FFB86B", "#6932A8"]
  }[resolvedPlatform] || ["#5CE1FF", "#1D4ED8"];

  return svgDataUrl(`
    <svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="675" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette[0]}"/>
          <stop offset="1" stop-color="${palette[1]}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" rx="36" fill="#050D18"/>
      <rect x="24" y="24" width="1152" height="627" rx="28" fill="url(#bg)" fill-opacity="0.28"/>
      <rect x="72" y="72" width="1056" height="531" rx="28" stroke="rgba(255,255,255,0.22)" fill="rgba(9,15,29,0.58)"/>
      <circle cx="250" cy="338" r="104" fill="${palette[0]}" fill-opacity="0.22"/>
      <path d="M225 286L331 338L225 390V286Z" fill="white"/>
      <text x="416" y="298" fill="white" font-size="38" font-family="Segoe UI, Arial, sans-serif">Media Preview</text>
      <text x="416" y="360" fill="rgba(255,255,255,0.8)" font-size="24" font-family="Segoe UI, Arial, sans-serif">${title}</text>
      <text x="416" y="412" fill="rgba(255,255,255,0.62)" font-size="20" font-family="Segoe UI, Arial, sans-serif">Generated fallback thumbnail</text>
    </svg>
  `);
}

export function decodeDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(.+?);charset=UTF-8,(.*)$/i);

  if (!match) {
    throw new Error("Unsupported inline asset format.");
  }

  const [, contentType, payload] = match;
  return {
    buffer: Buffer.from(decodeURIComponent(payload), "utf8"),
    contentType,
    extension: contentType.includes("svg") ? "svg" : "bin"
  };
}

function parseNumericProgressValue(value) {
  if (!value || value === "NA") {
    return null;
  }

  const numericValue = Number.parseFloat(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function createInitialProgressState() {
  return {
    phase: "queued",
    downloadedBytes: 0,
    totalBytes: 0,
    speedBytesPerSecond: 0,
    etaSeconds: null,
    percentage: 0
  };
}

function serializeDownloadJob(job) {
  return {
    id: job.id,
    status: job.status,
    format: job.format,
    quality: job.quality,
    error: job.error || "",
    progress: {
      ...job.progress
    }
  };
}

async function destroyDownloadJob(jobId) {
  const job = downloadJobs.get(jobId);

  if (!job) {
    return;
  }

  const cleanupTimeout = downloadJobTimeouts.get(jobId);

  if (cleanupTimeout) {
    clearTimeout(cleanupTimeout);
    downloadJobTimeouts.delete(jobId);
  }

  downloadJobs.delete(jobId);

  if (job.child && !job.child.killed) {
    job.child.kill();
  }

  if (job.tempDirectory) {
    await rm(job.tempDirectory, { recursive: true, force: true }).catch(() => {});
  }
}

function scheduleDownloadJobCleanup(jobId, delay = JOB_TTL_MS) {
  const existingTimeout = downloadJobTimeouts.get(jobId);

  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const timeout = setTimeout(() => {
    destroyDownloadJob(jobId).catch(() => {});
  }, delay);

  downloadJobTimeouts.set(jobId, timeout);
}

function updateJobStatus(job, nextStatus, nextProgress = {}) {
  job.status = nextStatus;
  job.progress = {
    ...job.progress,
    ...nextProgress
  };
  job.updatedAt = Date.now();
}

function parseProgressLine(line) {
  if (!line.startsWith("progress:")) {
    return null;
  }

  const [, payload] = line.split("progress:");
  const [downloadedRaw, totalRaw, totalEstimateRaw, speedRaw, etaRaw] = payload.trim().split("|");
  const downloadedBytes = parseNumericProgressValue(downloadedRaw) || 0;
  const totalBytes =
    parseNumericProgressValue(totalRaw) || parseNumericProgressValue(totalEstimateRaw) || 0;
  const speedBytesPerSecond = parseNumericProgressValue(speedRaw) || 0;
  const etaSeconds = parseNumericProgressValue(etaRaw);
  const percentage = totalBytes > 0 ? Math.min((downloadedBytes / totalBytes) * 100, 100) : 0;

  return {
    downloadedBytes,
    totalBytes,
    speedBytesPerSecond,
    etaSeconds,
    percentage
  };
}

function observeProcessLines(stream, onLine) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);

    buffer = lines.pop() || "";

    lines
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach(onLine);
  });

  stream.on("end", () => {
    const line = buffer.trim();

    if (line) {
      onLine(line);
    }
  });
}

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      if (error.code === "ENOENT") {
        reject(new Error("yt-dlp is not installed or is not available on the server PATH."));
        return;
      }

      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || "The media command failed."));
    });
  });
}

function getOptionalCookieArgs() {
  const browser = process.env.FREE2ALL_COOKIES_FROM_BROWSER?.trim();

  if (!browser) {
    return [];
  }

  return ["--cookies-from-browser", browser];
}

function getProxyArgs(useProxy = false) {
  return useProxy && mediaProxyUrl ? ["--proxy", mediaProxyUrl] : [];
}

function hasProxyFallback() {
  return Boolean(mediaProxyUrl) && mediaProxyMode !== "disabled";
}

function shouldStartWithProxy() {
  return hasProxyFallback() && mediaProxyMode === "always";
}

function getAlternativeSourceUrls(sourceUrl) {
  try {
    const parsedUrl = new URL(sourceUrl);
    const hostname = parsedUrl.hostname.toLowerCase();
    const xHamsterHosts = ["xhamster.com", "www.xhamster.com", "xhamster.one", "www.xhamster.one", "xhms.pro", "www.xhms.pro"];

    if (!xHamsterHosts.includes(hostname)) {
      return [];
    }

    parsedUrl.hostname = "xhamster.desi";
    return [parsedUrl.toString()];
  } catch {
    return [];
  }
}

function getSourceAttemptPlan(sourceUrl) {
  const sourceUrls = [...new Set([sourceUrl, ...getAlternativeSourceUrls(sourceUrl)])];

  if (shouldStartWithProxy()) {
    return sourceUrls
      .filter(() => hasProxyFallback())
      .map((url) => ({
        url,
        useProxy: true
      }));
  }

  return [
    ...sourceUrls.map((url) => ({
      url,
      useProxy: false
    })),
    ...sourceUrls
      .filter(() => hasProxyFallback())
      .map((url) => ({
        url,
        useProxy: true
      }))
  ];
}

function isProxyRetryCandidate(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return [
    "http error 520",
    "http error 521",
    "http error 522",
    "http error 523",
    "http error 524",
    "http error 403",
    "http error 429",
    "forbidden",
    "captcha",
    "cloudflare",
    "connection was reset",
    "tls",
    "ssl",
    "geo",
    "region",
    "country"
  ].some((needle) => message.includes(needle));
}

function getYtDlpBaseArgs(useProxy = false) {
  return [
    "--js-runtimes",
    "node",
    "--remote-components",
    "ejs:github",
    "--extractor-retries",
    "3",
    "--retries",
    "10",
    "--fragment-retries",
    "10",
    "--retry-sleep",
    "http:linear=1::2",
    "--socket-timeout",
    "30",
    "--concurrent-fragments",
    "4",
    "--age-limit",
    "99",
    "--no-check-certificates",
    ...getProxyArgs(useProxy),
    ...getOptionalCookieArgs(),
    "--no-playlist",
    "--no-warnings"
  ];
}

async function fetchYtDlpInfo(url) {
  const attempts = getSourceAttemptPlan(url);
  let lastError;

  for (const attempt of attempts) {
    try {
      const { stdout } = await runProcess(ytDlpBinary, [
        ...getYtDlpBaseArgs(attempt.useProxy),
        "--dump-single-json",
        "--skip-download",
        attempt.url
      ]);

      const payload = JSON.parse(stdout);

      if (payload._type === "playlist") {
        throw new Error("Playlists are not supported right now. Paste a single video URL.");
      }

      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to inspect the media source.");
}

function getFormatSize(format) {
  const size = format?.filesize || format?.filesize_approx || 0;
  return Number.isFinite(size) ? size : 0;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainder = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getBestThumbnail(info, sourceUrl, title) {
  const explicitThumbnail = info.thumbnail || info.thumbnails?.at(-1)?.url;

  if (explicitThumbnail) {
    return explicitThumbnail;
  }

  return createThumbnailForUrl(sourceUrl, normalizePlatform(info.extractor_key || info.extractor), title);
}

function getAudioFormats(info) {
  return (info.formats || []).filter((format) => format.acodec && format.acodec !== "none" && format.vcodec === "none");
}

function getVideoFormats(info) {
  return (info.formats || []).filter((format) => format.vcodec && format.vcodec !== "none" && Number.isFinite(format.height));
}

function pickBestAudioFormat(info) {
  return [...getAudioFormats(info)].sort((left, right) => {
    const abrDiff = (right.abr || right.tbr || 0) - (left.abr || left.tbr || 0);

    if (abrDiff !== 0) {
      return abrDiff;
    }

    return getFormatSize(right) - getFormatSize(left);
  })[0];
}

function getAvailableHeights(info) {
  return [...new Set(getVideoFormats(info).map((format) => format.height).filter(Boolean))].sort((left, right) => right - left);
}

function pickHeightAtOrBelow(heights, desired) {
  return heights.find((height) => height <= desired) || heights[0] || null;
}

function buildFallbackTitle(sourceUrl) {
  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./i, "");
    return `Media from ${hostname}`;
  } catch {
    return "Media Download";
  }
}

function isKnownCollectionUrl(sourceUrl) {
  try {
    const parsedUrl = new URL(sourceUrl);
    const pathname = parsedUrl.pathname.toLowerCase();

    return [
      "/categories/",
      "/category/",
      "/playlist/",
      "/playlists/",
      "/collections/",
      "/albums/",
      "/search/",
      "/tags/",
      "/tag/"
    ].some((segment) => pathname.includes(segment));
  } catch {
    return false;
  }
}

function createGenericDownloadSet(sourceUrl, title, mode) {
  if (mode === "audio") {
    return [buildAudioDownload(sourceUrl, title)];
  }

  if (mode === "thumbnail") {
    return [buildThumbnailDownload(sourceUrl, title, createThumbnailForUrl(sourceUrl, undefined, title))];
  }

  return [
    {
      id: "mp4-best",
      label: "MP4 Best",
      format: "mp4",
      quality: "best",
      kind: "video",
      size: "Preparing",
      downloadUrl: buildDownloadUrl({
        sourceUrl,
        title,
        format: "mp4",
        quality: "best"
      })
    },
    {
      id: "mp4-720",
      label: "MP4 720p",
      format: "mp4",
      quality: "720p",
      kind: "video",
      size: "Preparing",
      downloadUrl: buildDownloadUrl({
        sourceUrl,
        title,
        format: "mp4",
        quality: "720p"
      })
    },
    buildAudioDownload(sourceUrl, title)
  ];
}

function createCollectionPageResult({ url, mode = "video" }) {
  const title = buildFallbackTitle(url);

  return {
    mock: false,
    mode,
    media: {
      title,
      sourceUrl: url,
      platform: "generic",
      platformLabel: genericSourceLabel,
      creator: "Source media",
      duration: "Collection page",
      estimatedSize: "Choose a single item",
      thumbnail: createThumbnailForUrl(url, undefined, title),
      downloads: [],
      insights: [
        "Collection or category page detected",
        "This link lists multiple items instead of one direct media page",
        "Paste a single video page from inside the collection to download media"
      ],
      notice:
        "This URL is a category, tag, search, or playlist-style page. Free2All can only download a specific media page when the source site blocks collection-page extraction."
    }
  };
}

function createFallbackMediaResult({ url, mode = "video", error }) {
  const title = buildFallbackTitle(url);
  const thumbnail = createThumbnailForUrl(url, undefined, title);
  const downloads = createGenericDownloadSet(url, title, mode);

  return {
    mock: false,
    mode,
    media: {
      title,
      sourceUrl: url,
      platform: "generic",
      platformLabel: genericSourceLabel,
      creator: "Source media",
      duration: "Unknown",
      estimatedSize: downloads[0]?.size || "Preparing",
      thumbnail,
      downloads,
      insights: [
        "Link accepted in fallback mode",
        mode === "audio" ? "Audio extraction will be attempted directly" : "Direct media extraction will be attempted",
        "Some websites still require login cookies, region access, or may block automated downloads"
      ],
      notice:
        error || "Metadata could not be fetched in advance, but Free2All will still try to prepare the media directly."
    }
  };
}

function pickVideoEstimate(info, height) {
  const audio = pickBestAudioFormat(info);
  const video = [...getVideoFormats(info)]
    .filter((format) => format.height <= height)
    .sort((left, right) => {
      const heightDiff = (right.height || 0) - (left.height || 0);

      if (heightDiff !== 0) {
        return heightDiff;
      }

      const mp4Preference = Number((right.ext || "").toLowerCase() === "mp4") - Number((left.ext || "").toLowerCase() === "mp4");

      if (mp4Preference !== 0) {
        return mp4Preference;
      }

      return (right.tbr || 0) - (left.tbr || 0);
    })[0];

  return formatBytes(getFormatSize(video) + getFormatSize(audio));
}

function inferPlatform(sourceUrl, info) {
  return detectPlatform(sourceUrl) || normalizePlatform(info.extractor_key || info.extractor || info.webpage_url_domain);
}

function buildAudioDownload(sourceUrl, title, size = "Preparing") {
  return {
    id: "mp3-standard",
    label: "Audio",
    format: "mp3",
    quality: "Best",
    kind: "audio",
    size,
    downloadUrl: buildDownloadUrl({
      sourceUrl,
      title,
      format: "mp3",
      quality: "best"
    })
  };
}

function buildThumbnailDownload(sourceUrl, title, thumbnailUrl) {
  return {
    id: "thumbnail",
    label: "Download Thumbnail",
    format: "jpg",
    quality: "HD",
    kind: "image",
    size: "Preparing",
    downloadUrl: buildDownloadUrl({
      sourceUrl,
      title,
      format: "jpg",
      quality: "HD",
      variant: "thumbnail",
      thumbnailUrl
    })
  };
}

function buildVideoDownloads(sourceUrl, title, info) {
  const heights = getAvailableHeights(info);
  const selectedHeights = [];

  const primary = pickHeightAtOrBelow(heights, 1080);
  if (primary) {
    selectedHeights.push(primary);
  }

  const secondary = pickHeightAtOrBelow(
    heights.filter((height) => height < (primary || Number.POSITIVE_INFINITY)),
    720
  );

  if (secondary && !selectedHeights.includes(secondary)) {
    selectedHeights.push(secondary);
  }

  if (!selectedHeights.length) {
    selectedHeights.push("best");
  }

  const downloads = selectedHeights.map((height) => ({
    id: `mp4-${height}`,
    label: height === "best" ? "MP4 Best" : `MP4 ${height}p`,
    format: "mp4",
    quality: height === "best" ? "best" : `${height}p`,
    kind: "video",
    size: height === "best" ? formatBytes(getFormatSize(info.requested_downloads?.[0]) || getFormatSize(info)) : pickVideoEstimate(info, height),
    downloadUrl: buildDownloadUrl({
      sourceUrl,
      title,
      format: "mp4",
      quality: height === "best" ? "best" : `${height}p`
    })
  }));

  downloads.push(buildAudioDownload(sourceUrl, title));
  return downloads;
}

export async function extractMedia({ url, mode = "video" }) {
  if (isKnownCollectionUrl(url)) {
    return createCollectionPageResult({ url, mode });
  }

  try {
    const info = await fetchYtDlpInfo(url);
    const platform = inferPlatform(url, info);
    const platformLabel = genericSourceLabel;
    const title = info.title || "Media Download";
    const thumbnail = getBestThumbnail(info, url, title);
    const audioFormat = pickBestAudioFormat(info);
    const audioSizeBytes = getFormatSize(audioFormat);
    const audioSize = audioSizeBytes > 0 ? formatBytes(audioSizeBytes) : "Preparing";

    const downloads =
      mode === "audio"
        ? [buildAudioDownload(url, title, audioSize)]
        : mode === "thumbnail"
          ? [buildThumbnailDownload(url, title, thumbnail)]
          : buildVideoDownloads(url, title, info);

    return {
      mock: false,
      mode,
      media: {
        title,
        sourceUrl: url,
        platform: platform || "generic",
        platformLabel,
        creator: info.channel || info.uploader || info.creator || "Source media",
        duration: formatDuration(info.duration),
        estimatedSize: downloads[0]?.size || formatBytes(getFormatSize(audioFormat) || getFormatSize(info)),
        thumbnail,
        downloads,
        insights: [
          "Supported media link detected",
          mode === "audio" ? "Ready for audio conversion" : "Ready for direct download",
          "Files are fetched on demand through the extractor-backed download flow"
        ],
        notice: "Downloads are generated on demand, so larger files can take a little longer to prepare."
      }
    };
  } catch (error) {
    return createFallbackMediaResult({
      url,
      mode,
      error: normalizeDownloadError(error)
    });
  }
}

function buildVideoSelector(quality) {
  if (!quality || quality === "best") {
    return "bv*+ba/b";
  }

  const height = Number.parseInt(String(quality).replace(/[^0-9]/g, ""), 10);

  if (!Number.isFinite(height)) {
    return "bv*+ba/b";
  }

  return `bv*[height<=?${height}]+ba/b[height<=?${height}]/b[height<=?${height}]/bv*+ba/b`;
}

function getContentType(extension) {
  switch (extension.toLowerCase()) {
    case "mp4":
      return "video/mp4";
    case "mp3":
      return "audio/mpeg";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function createCleanup(tempDirectory, onCleanup) {
  let cleanedUp = false;

  return async function cleanup() {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    await rm(tempDirectory, { recursive: true, force: true }).catch(() => {});

    if (onCleanup) {
      await onCleanup().catch(() => {});
    }
  };
}

async function findDownloadedFile(tempDirectory, format) {
  const entries = await readdir(tempDirectory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(tempDirectory, entry.name));

  const expectedExtension = format === "mp3" ? ".mp3" : format === "mp4" ? ".mp4" : "";
  const matchingFiles = expectedExtension ? files.filter((filePath) => path.extname(filePath).toLowerCase() === expectedExtension) : files;
  const candidates = matchingFiles.length ? matchingFiles : files;

  if (!candidates.length) {
    throw new Error("The media file finished processing but no output file was found.");
  }

  const filesWithStats = await Promise.all(
    candidates.map(async (filePath) => ({
      filePath,
      stats: await stat(filePath)
    }))
  );

  return filesWithStats.sort((left, right) => right.stats.mtimeMs - left.stats.mtimeMs)[0].filePath;
}

async function clearTempDirectoryContents(tempDirectory) {
  const entries = await readdir(tempDirectory, { withFileTypes: true }).catch(() => []);

  await Promise.all(
    entries.map((entry) =>
      rm(path.join(tempDirectory, entry.name), {
        recursive: true,
        force: true
      }).catch(() => {})
    )
  );
}

function buildYtDlpDownloadArgs({ tempDirectory, sourceUrl, format, quality, withProgress = false, useProxy = false }) {
  const outputTemplate = path.join(tempDirectory, "%(title)s.%(ext)s");
  const baseArgs = [
    ...getYtDlpBaseArgs(useProxy),
    "--no-warnings",
    "-o",
    outputTemplate
  ];

  if (withProgress) {
    baseArgs.push(
      "--newline",
      "--progress-template",
      "download:progress:%(progress.downloaded_bytes)s|%(progress.total_bytes)s|%(progress.total_bytes_estimate)s|%(progress.speed)s|%(progress.eta)s"
    );
  } else {
    baseArgs.push("--quiet", "--no-progress", "--print", "after_move:filepath");
  }

  if (format === "mp3") {
    return [
      ...baseArgs,
      "--ffmpeg-location",
      ffmpegPath,
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      sourceUrl
    ];
  }

  return [
    ...baseArgs,
    "--ffmpeg-location",
    ffmpegPath,
    "--remux-video",
    "mp4",
    "--recode-video",
    "mp4",
    "-f",
    buildVideoSelector(quality),
    sourceUrl
  ];
}

function normalizeDownloadError(error) {
  const message = String(error?.message || error || "Unable to prepare the download.")
    .replace(/^ERROR:\s*/i, "")
    .replace(/^\[[^\]]+\]\s*/i, "");
  const lowered = message.toLowerCase();

  if (lowered.includes("drm")) {
    return "This media appears to be DRM-protected, so Free2All cannot download it.";
  }

  if (lowered.includes("certificate verify failed") || lowered.includes("ssl")) {
    return "The source website failed SSL verification from the current environment, so the download could not be prepared cleanly.";
  }

  if (lowered.includes("404") || lowered.includes("not found")) {
    return "The page responded, but no downloadable media was found at that link.";
  }

  if (
    lowered.includes("login required") ||
    lowered.includes("sign in") ||
    lowered.includes("cookies") ||
    lowered.includes("members only") ||
    lowered.includes("private video")
  ) {
    return "This page likely needs a logged-in browser session or cookies before it can be downloaded.";
  }

  if (lowered.includes("geo") || lowered.includes("country") || lowered.includes("region")) {
    return "This media looks region-restricted from the current network.";
  }

  if (
    lowered.includes("cloudflare") ||
    lowered.includes("captcha") ||
    lowered.includes("http error 520") ||
    lowered.includes("http error 521") ||
    lowered.includes("http error 522") ||
    lowered.includes("http error 523") ||
    lowered.includes("http error 524") ||
    lowered.includes("http error 403") ||
    lowered.includes("http error 429") ||
    lowered.includes("forbidden")
  ) {
    return "The source website blocked automated access from the current network, so the file could not be prepared.";
  }

  return message;
}

async function failDownloadJob(job, error) {
  job.error = normalizeDownloadError(error);
  updateJobStatus(job, "error", {
    phase: "error",
    speedBytesPerSecond: 0,
    etaSeconds: null
  });

  if (job.tempDirectory) {
    await rm(job.tempDirectory, { recursive: true, force: true }).catch(() => {});
    job.tempDirectory = "";
    job.filePath = "";
  }

  scheduleDownloadJobCleanup(job.id, 2 * 60 * 1000);
}

export async function startDownloadJob({ sourceUrl, title, format, quality }) {
  const id = randomUUID();
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "free2all-"));
  const attempts = getSourceAttemptPlan(sourceUrl);
  const job = {
    id,
    sourceUrl,
    title,
    format,
    quality,
    tempDirectory,
    filePath: "",
    error: "",
    status: "queued",
    progress: createInitialProgressState(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  downloadJobs.set(id, job);
  scheduleDownloadJobCleanup(id);

  async function launch(attemptIndex = 0) {
    const attempt = attempts[attemptIndex];

    if (!attempt) {
      await failDownloadJob(job, job.error || "The downloader exited before the file was ready.");
      return;
    }

    if (attemptIndex > 0) {
      await clearTempDirectoryContents(tempDirectory);
      job.error = "";
      updateJobStatus(job, "retrying", {
        ...createInitialProgressState(),
        phase: "retrying"
      });
    }

    const args = buildYtDlpDownloadArgs({
      tempDirectory,
      sourceUrl: attempt.url,
      format,
      quality,
      withProgress: true,
      useProxy: attempt.useProxy
    });

    const child = spawn(ytDlpBinary, args, {
      env: process.env,
      windowsHide: true
    });

    job.child = child;
    let finished = false;

    const retryOrFail = async (error) => {
      if (finished) {
        return;
      }

      finished = true;

      if (attemptIndex + 1 < attempts.length) {
        try {
          await launch(attemptIndex + 1);
          return;
        } catch (retryError) {
          await failDownloadJob(job, retryError);
          return;
        }
      }

      await failDownloadJob(job, error);
    };

    const handleLine = (line) => {
      const progress = parseProgressLine(line);

      if (progress) {
        updateJobStatus(job, progress.percentage >= 100 ? "processing" : "downloading", {
          phase: progress.percentage >= 100 ? "processing" : "downloading",
          ...progress
        });
        return;
      }

      if (line.startsWith("[download] Destination:")) {
        updateJobStatus(job, "downloading", {
          phase: "downloading"
        });
        return;
      }

      if (line.startsWith("[Merger]") || line.startsWith("[ExtractAudio]")) {
        updateJobStatus(job, "processing", {
          phase: "processing",
          speedBytesPerSecond: 0,
          etaSeconds: null
        });
        return;
      }

      if (line.startsWith("ERROR:")) {
        job.error = normalizeDownloadError(line);
      }
    };

    observeProcessLines(child.stdout, handleLine);
    observeProcessLines(child.stderr, handleLine);

    child.on("error", (error) => {
      retryOrFail(error).catch(() => {});
    });

    child.on("close", async (code) => {
      if (finished) {
        return;
      }

      if (code !== 0) {
        await retryOrFail(job.error || "The downloader exited before the file was ready.");
        return;
      }

      finished = true;

      try {
        const filePath = await findDownloadedFile(tempDirectory, format);
        const fileStats = await stat(filePath);

        job.filePath = filePath;
        updateJobStatus(job, "ready", {
          phase: "ready",
          downloadedBytes: fileStats.size,
          totalBytes: fileStats.size,
          speedBytesPerSecond: 0,
          etaSeconds: 0,
          percentage: 100
        });
        scheduleDownloadJobCleanup(job.id);
      } catch (error) {
        await failDownloadJob(job, error);
      }
    });
  }

  await launch();

  return serializeDownloadJob(job);
}

export function getDownloadJob(jobId) {
  const job = downloadJobs.get(jobId);
  return job ? serializeDownloadJob(job) : null;
}

export function getDownloadJobAsset(jobId) {
  return downloadJobs.get(jobId) || null;
}

export async function cleanupDownloadJob(jobId) {
  await destroyDownloadJob(jobId);
}

export async function downloadMediaAsset({ sourceUrl, title, format, quality }) {
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "free2all-"));
  const attempts = getSourceAttemptPlan(sourceUrl);
  let lastError;

  for (const [attemptIndex, attempt] of attempts.entries()) {
    if (attemptIndex > 0) {
      await clearTempDirectoryContents(tempDirectory);
    }

    const args = buildYtDlpDownloadArgs({
      tempDirectory,
      sourceUrl: attempt.url,
      format,
      quality,
      withProgress: false,
      useProxy: attempt.useProxy
    });

    try {
      await runProcess(ytDlpBinary, args);
      const filePath = await findDownloadedFile(tempDirectory, format);

      return { filePath, tempDirectory };
    } catch (error) {
      lastError = error;
    }
  }

  await rm(tempDirectory, { recursive: true, force: true }).catch(() => {});
  throw lastError || new Error("Unable to prepare the download.");
}

export async function createDownloadResponse({ filePath, tempDirectory, title, format, onCleanup }) {
  const cleanup = createCleanup(tempDirectory, onCleanup);
  const fileStats = await stat(filePath);
  const extension = path.extname(filePath).slice(1) || format || "bin";
  const stream = createReadStream(filePath);

  stream.once("close", cleanup);
  stream.once("error", cleanup);

  return new Response(Readable.toWeb(stream), {
    headers: {
      "content-type": getContentType(extension),
      "content-length": String(fileStats.size),
      "content-disposition": `attachment; filename="${buildFilename(title, extension)}"`,
      "cache-control": "no-store"
    }
  });
}
