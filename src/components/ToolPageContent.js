import { DownloaderClient } from "@/components/DownloaderClient";
import { ImageCompressorClient } from "@/components/ImageCompressorClient";
import { PasswordGeneratorClient } from "@/components/PasswordGeneratorClient";
import { PdfMergerClient } from "@/components/PdfMergerClient";
import { WordCounterClient } from "@/components/WordCounterClient";

export function ToolPageContent({ slug }) {
  switch (slug) {
    case "video-downloader":
      return <DownloaderClient mode="video" />;
    case "thumbnail-downloader":
      return <DownloaderClient mode="thumbnail" />;
    case "audio-converter":
      return <DownloaderClient mode="audio" />;
    case "image-compressor":
      return <ImageCompressorClient />;
    case "pdf-merger":
      return <PdfMergerClient />;
    case "password-generator":
      return <PasswordGeneratorClient />;
    case "word-counter":
      return <WordCounterClient />;
    default:
      return null;
  }
}
