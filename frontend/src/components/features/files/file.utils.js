import {
  Archive,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
} from "lucide-react";

export function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function getFileIcon(mimeType = "") {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;

  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("text") ||
    mimeType.includes("csv") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  ) {
    return FileText;
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("gzip") ||
    mimeType.includes("7z")
  ) {
    return Archive;
  }

  return File;
}