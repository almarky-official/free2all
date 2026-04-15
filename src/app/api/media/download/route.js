import { NextResponse } from "next/server";

import {
  buildFilename,
  cleanupDownloadJob,
  createDownloadResponse,
  createThumbnailForUrl,
  getDownloadJob,
  getDownloadJobAsset,
  downloadMediaAsset,
  startDownloadJob,
  decodeDataUrl
} from "@/lib/media";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const sourceUrl = searchParams.get("sourceUrl");
  const title = searchParams.get("title") || "Free2All Download";
  const format = searchParams.get("format") || "bin";
  const quality = searchParams.get("quality") || "standard";
  const selector = searchParams.get("selector") || "";
  const variant = searchParams.get("variant") || "media";
  const thumbnailUrl = searchParams.get("thumbnailUrl");
  const view = searchParams.get("view");

  if (jobId) {
    const job = getDownloadJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Download session not found or expired." }, { status: 404 });
    }

    if (view === "status") {
      return NextResponse.json(job, {
        headers: {
          "cache-control": "no-store"
        }
      });
    }

    if (job.status !== "ready") {
      return NextResponse.json(
        {
          error: job.status === "error" ? job.error : "Download is still being prepared.",
          status: job.status,
          progress: job.progress
        },
        { status: job.status === "error" ? 400 : 409 }
      );
    }

    const asset = getDownloadJobAsset(jobId);

    if (!asset?.filePath) {
      return NextResponse.json({ error: "Download file is no longer available." }, { status: 404 });
    }

    return createDownloadResponse({
      filePath: asset.filePath,
      tempDirectory: asset.tempDirectory,
      title: asset.title,
      format: asset.format,
      onCleanup: async () => {
        await cleanupDownloadJob(jobId);
      }
    });
  }

  if (!sourceUrl) {
    return NextResponse.json({ error: "Missing source URL." }, { status: 400 });
  }

  if (variant === "thumbnail") {
    const thumbnail = thumbnailUrl || createThumbnailForUrl(sourceUrl, undefined, title);

    if (thumbnail.startsWith("http")) {
      try {
        const response = await fetch(thumbnail, { cache: "no-store" });

        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          return new Response(buffer, {
            headers: {
              "content-type": response.headers.get("content-type") || "image/jpeg",
              "content-disposition": `attachment; filename="${buildFilename(title, "jpg")}"`,
              "cache-control": "no-store"
            }
          });
        }
      } catch {
        // Fall through to the generated inline thumbnail asset.
      }
    }

    const { buffer, contentType, extension } = decodeDataUrl(createThumbnailForUrl(sourceUrl, "generic", title));
    return new Response(buffer, {
      headers: {
        "content-type": contentType,
        "content-disposition": `attachment; filename="${buildFilename(title, extension)}"`,
        "cache-control": "no-store"
      }
    });
  }

  try {
    const asset = await downloadMediaAsset({
      sourceUrl,
      title,
      format,
      quality,
      selector
    });

    return await createDownloadResponse({
      ...asset,
      title,
      format
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unable to prepare the download."
      },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get("sourceUrl");
  const title = searchParams.get("title") || "Free2All Download";
  const format = searchParams.get("format") || "bin";
  const quality = searchParams.get("quality") || "standard";
  const selector = searchParams.get("selector") || "";
  const variant = searchParams.get("variant") || "media";

  if (!sourceUrl) {
    return NextResponse.json({ error: "Missing source URL." }, { status: 400 });
  }

  if (variant === "thumbnail") {
    return NextResponse.json({ error: "Thumbnail downloads do not need queued progress." }, { status: 400 });
  }

  try {
    const job = await startDownloadJob({
      sourceUrl,
      title,
      format,
      quality,
      selector
    });

    return NextResponse.json(job, {
      headers: {
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unable to start the download."
      },
      { status: 400 }
    );
  }
}
