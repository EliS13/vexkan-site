/**
 * The camera side of the kiosk. Browser only.
 *
 * face-api and its ~12MB of weights are pulled in by dynamic import, so a
 * member signing out by tapping their tile never downloads any of it.
 *
 * No frame, descriptor or crop produced here is sent anywhere. Descriptors are
 * held on the iPad (see faceStore.ts) and the `face_embedding` column stays
 * null, which is the position the brief takes until written parent consent is
 * actually in place.
 */
import type * as FaceApi from "@vladmandic/face-api";
import { checkQuality, type DetectionQuality } from "./matching";

const MODEL_URL = "/models/face";

type Api = typeof FaceApi;
let api: Api | null = null;
let loading: Promise<Api> | null = null;

/** Loads the library and weights once, and returns the same instance after. */
export function loadFaceEngine(): Promise<Api> {
  if (api) return Promise.resolve(api);
  if (loading) return loading;

  loading = (async () => {
    const faceapi = await import("@vladmandic/face-api");
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    api = faceapi;
    return faceapi;
  })();

  return loading;
}

export type DetectedFace = {
  descriptor: number[];
  box: { x: number; y: number; width: number; height: number };
  score: number;
  quality: ReturnType<typeof checkQuality>;
};

type Source = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

function frameSizeOf(source: Source): { width: number; height: number } {
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  if (source instanceof HTMLImageElement) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  return { width: source.width, height: source.height };
}

function toDetected(
  detection: { detection: { score: number; box: DetectionQuality["box"] } },
  descriptor: Float32Array,
  frame: { width: number; height: number },
  minPx?: number,
  quality: { allowEdge?: boolean } = {},
): DetectedFace {
  const box = {
    x: detection.detection.box.x,
    y: detection.detection.box.y,
    width: detection.detection.box.width,
    height: detection.detection.box.height,
  };
  return {
    descriptor: Array.from(descriptor),
    box,
    score: detection.detection.score,
    quality: checkQuality({ score: detection.detection.score, box }, frame, minPx, quality),
  };
}

/**
 * One face, for enrollment. Returns null when the frame holds none.
 *
 * Deliberately fails when it finds more than one: enrolling from a frame with a
 * bystander in it risks storing the wrong person's descriptor under a member's
 * name, and that error is invisible once made.
 */
export async function detectOne(
  source: Source,
  options: { allowEdge?: boolean } = {},
): Promise<{ face: DetectedFace | null; extraFaces: number }> {
  const faceapi = await loadFaceEngine();
  const frame = frameSizeOf(source);

  const results = await faceapi
    .detectAllFaces(source, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (results.length === 0) return { face: null, extraFaces: 0 };

  // Largest face wins when several are present, but the caller is told.
  const sorted = [...results].sort(
    (a, b) => b.detection.box.width * b.detection.box.height -
      a.detection.box.width * a.detection.box.height,
  );
  return {
    face: toDetected(sorted[0], sorted[0].descriptor, frame, undefined, options),
    extraFaces: results.length - 1,
  };
}

/**
 * Every face in the frame, for group sign-in.
 *
 * A lower confidence floor than enrollment, because a face across the room is
 * genuinely harder to detect — but the quality gate on each result is what
 * decides whether it is allowed to reach the matcher, and a smaller minimum
 * face size applies since people stand further back for a group shot.
 */
export async function detectAll(source: Source, minPx = 60): Promise<DetectedFace[]> {
  const faceapi = await loadFaceEngine();
  const frame = frameSizeOf(source);

  const results = await faceapi
    .detectAllFaces(source, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  return results.map((r) => toDetected(r, r.descriptor, frame, minPx));
}

/**
 * Square crop around a face, at the size the roster stores.
 *
 * Padded out to 1.6x the detection box so the crop holds hair and jaw rather
 * than a tight rectangle of features, and clamped to the frame so a face near
 * the edge does not produce a crop with black bars in it.
 */
export function cropFace(
  source: Source,
  box: { x: number; y: number; width: number; height: number },
  size = 400,
): string {
  const frame = frameSizeOf(source);
  const side = Math.max(box.width, box.height) * 1.6;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  const clamped = Math.min(side, frame.width, frame.height);
  const sx = Math.max(0, Math.min(cx - clamped / 2, frame.width - clamped));
  const sy = Math.max(0, Math.min(cy - clamped / 2, frame.height - clamped));

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(source, sx, sy, clamped, clamped, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.85);
}

/**
 * Copies a video frame into a canvas.
 *
 * Everything downstream reads from this canvas rather than the live <video>, so
 * a group photo's faces are all matched against the same instant. It also pins
 * the handedness: the preview is mirrored with CSS so the room behaves like a
 * mirror, but the pixels captured here are never flipped. Enrollment and
 * sign-in must agree on that — a mirrored copy of a face scores as a different
 * person, measured at 0.77 against an unmirrored original.
 */
export function grabFrame(video: HTMLVideoElement): HTMLCanvasElement {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("The camera has not produced a picture yet. Wait a moment and try again.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(video, 0, 0);
  return canvas;
}
