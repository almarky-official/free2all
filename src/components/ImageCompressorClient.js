"use client";

import { ImagePlus, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { formatBytes } from "@/lib/utils";

export function ImageCompressorClient() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [quality, setQuality] = useState(78);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [previewUrl, result]);

  async function compressImage() {
    if (!file || !previewUrl) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const image = new window.Image();
      image.src = previewUrl;
      await image.decode();

      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Image processing is not available in this browser.");
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const targetType = file.type === "image/png" ? "image/webp" : file.type || "image/jpeg";
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, targetType, quality / 100);
      });

      if (!blob) {
        throw new Error("Compression failed. Try another image.");
      }

      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }

      const compressedUrl = URL.createObjectURL(blob);
      const metricsResponse = await fetch("/api/tools/image-compressor", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          name: file.name,
          originalSize: file.size,
          compressedSize: blob.size,
          quality
        })
      });
      const metrics = await metricsResponse.json().catch(() => null);
      const extension = targetType === "image/webp" ? "webp" : targetType === "image/png" ? "png" : "jpg";

      setResult({
        url: compressedUrl,
        size: blob.size,
        name: `${file.name.replace(/\.[^.]+$/, "")}-compressed.${extension}`,
        message: metrics?.message || "Image compressed and ready to download.",
        savings: Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100))
      });
    } catch (compressionError) {
      setError(compressionError.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="utility-shell">
      <div className="utility-panel glass-panel">
        <div className="tool-form-header tool-form-header-compact">
          <div>
            <span className="eyebrow">Upload Image</span>
            <h3>Compress an image</h3>
            <p>Adjust quality, process, and download the smaller file.</p>
          </div>
        </div>

        <label className="upload-box">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              if (!nextFile) {
                return;
              }

              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }

              if (result?.url) {
                URL.revokeObjectURL(result.url);
              }

              setFile(nextFile);
              setPreviewUrl(URL.createObjectURL(nextFile));
              setResult(null);
              setError("");
            }}
          />
          <ImagePlus size={22} />
          <span>{file ? file.name : "Select an image"}</span>
        </label>

        <div className="slider-grid">
          <label className="slider-card">
            <span>Quality</span>
            <strong>{quality}%</strong>
            <input type="range" min="20" max="95" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
          </label>
          <label className="slider-card">
            <span>Max width</span>
            <strong>{maxWidth}px</strong>
            <input
              type="range"
              min="640"
              max="2560"
              step="80"
              value={maxWidth}
              onChange={(event) => setMaxWidth(Number(event.target.value))}
            />
          </label>
        </div>

        <button className="button button-primary" type="button" onClick={compressImage} disabled={!file || processing}>
          {processing ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
          Compress Image
        </button>

        {error ? <div className="status-card error">{error}</div> : null}
      </div>

      {(previewUrl || result) && (
        <div className="media-compare-grid">
          {previewUrl ? (
            <article className="glass-panel compare-card">
              <span className="eyebrow">Original</span>
              <img src={previewUrl} alt="Original preview" className="compare-image" loading="lazy" decoding="async" />
              <p>{file ? formatBytes(file.size) : "0 B"}</p>
            </article>
          ) : null}

          {result ? (
            <article className="glass-panel compare-card">
              <span className="eyebrow">Compressed</span>
              <img src={result.url} alt="Compressed preview" className="compare-image" loading="lazy" decoding="async" />
              <p>
                {formatBytes(result.size)} | {result.savings}% smaller
              </p>
              <a href={result.url} download={result.name} className="button button-secondary">
                Download File
              </a>
              <small>{result.message}</small>
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}
