"use client";

import { FileStack, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { formatBytes } from "@/lib/utils";

export function PdfMergerClient() {
  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  async function mergePdfs() {
    if (files.length < 2) {
      setError("Add at least two PDF files to merge them.");
      return;
    }

    setMerging(true);
    setError("");
    setDownloadUrl((currentValue) => {
      if (currentValue) {
        URL.revokeObjectURL(currentValue);
      }

      return "";
    });

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/tools/pdf-merger", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Could not merge the selected PDFs.");
      }

      const blob = await response.blob();
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      setDownloadUrl(URL.createObjectURL(blob));
    } catch (mergeError) {
      setError(mergeError.message);
    } finally {
      setMerging(false);
    }
  }

  return (
    <div className="utility-shell">
      <div className="utility-panel glass-panel">
        <div className="tool-form-header tool-form-header-compact">
          <div>
            <span className="eyebrow">Upload PDFs</span>
            <h3>Merge PDF files</h3>
            <p>Select files, merge them, and download the result.</p>
          </div>
        </div>

        <label className="upload-box">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(event) => {
              if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
              }

              setFiles(Array.from(event.target.files || []));
              setDownloadUrl("");
              setError("");
            }}
          />
          <FileStack size={22} />
          <span>{files.length ? `${files.length} PDF files selected` : "Select two or more PDF files"}</span>
        </label>

        <div className="file-list">
          {files.map((file) => (
            <div className="file-row" key={`${file.name}-${file.size}`}>
              <span>{file.name}</span>
              <span>{formatBytes(file.size)}</span>
            </div>
          ))}
        </div>

        <button className="button button-primary" type="button" onClick={mergePdfs} disabled={merging || files.length < 2}>
          {merging ? <LoaderCircle className="spin" size={18} /> : <FileStack size={18} />}
          Merge PDFs
        </button>

        {error ? <div className="status-card error">{error}</div> : null}
        {downloadUrl ? (
          <a href={downloadUrl} download="free2all-merged.pdf" className="button button-secondary">
            Download PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}
