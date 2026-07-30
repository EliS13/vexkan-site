/**
 * Photos go into localStorage as data URLs, and localStorage is only a few
 * megabytes, so every upload gets resized and re-encoded before it is stored.
 * A phone photo straight off the camera would eat the whole budget on its own.
 */
const MAX_EDGE = 1200;
const QUALITY = 0.8;

export async function fileToResizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  // Flatten onto white, otherwise transparent PNGs turn black as JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  return canvas.toDataURL("image/jpeg", QUALITY);
}

/** pptxgenjs wants the mime and payload without the leading "data:". */
export function toPptxData(dataUrl: string): string {
  return dataUrl.replace(/^data:/, "");
}

export function approxBytes(dataUrl: string): number {
  const payload = dataUrl.split(",")[1] ?? "";
  return Math.round((payload.length * 3) / 4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
