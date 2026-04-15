import { chmod, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function getYtDlpAssetName() {
  if (process.platform === "win32") {
    return "yt-dlp.exe";
  }

  if (process.platform === "darwin") {
    return "yt-dlp_macos";
  }

  if (process.platform === "linux" && process.arch === "arm64") {
    return "yt-dlp_linux_aarch64";
  }

  if (process.platform === "linux") {
    return "yt-dlp_linux";
  }

  return "yt-dlp";
}

const ytDlpBinaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const ytDlpAssetName = getYtDlpAssetName();
const targetPath =
  process.env.YT_DLP_INSTALL_PATH?.trim() || path.join(process.cwd(), "vendor", "yt-dlp", ytDlpBinaryName);
const downloadUrl =
  process.env.YT_DLP_DOWNLOAD_URL?.trim() ||
  `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ytDlpAssetName}`;
const skipDownload = /^(1|true)$/i.test(process.env.SKIP_YT_DLP_DOWNLOAD || "");

function log(message) {
  console.log(`[yt-dlp] ${message}`);
}

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function ensureExecutable(filePath) {
  if (process.platform === "win32") {
    return;
  }

  await chmod(filePath, 0o755).catch(() => {});
}

async function installBinary() {
  if (skipDownload) {
    log("Skipping binary download because SKIP_YT_DLP_DOWNLOAD is enabled.");
    return;
  }

  if (await fileExists(targetPath)) {
    await ensureExecutable(targetPath);
    log(`Binary already available at ${targetPath}`);
    return;
  }

  await mkdir(path.dirname(targetPath), { recursive: true });

  const response = await fetch(downloadUrl, {
    redirect: "follow",
    headers: {
      "user-agent": "free2all-yt-dlp-installer"
    }
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (!buffer.length) {
    throw new Error("Downloaded yt-dlp binary was empty.");
  }

  await writeFile(targetPath, buffer);
  await ensureExecutable(targetPath);
  log(`Installed yt-dlp to ${targetPath}`);
}

installBinary().catch((error) => {
  console.warn(`[yt-dlp] Bundled install skipped: ${error.message}`);
  process.exit(0);
});
