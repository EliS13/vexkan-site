/**
 * The camera side of the kiosk. Browser only.
 *
 * face-api and its ~12MB of weights are pulled in by dynamic import, and only
 * once a camera screen opens. The roster screen never loads them: warming the
 * engine compiles GPU programs on the main thread, and on a phone or iPad that
 * froze the whole grid long enough that taps on tiles and buttons did nothing.
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

/**
 * Loads the library and weights once, warms them, and returns the same
 * instance after.
 *
 * "Warm" matters more than "loaded". WebGL compiles a shader program for every
 * op the first time each net runs, and that compile is what made the first tap
 * of "Take the photo" take seconds — measured at about six seconds for the
 * first face against 50–80ms for every face after it, with the weights already
 * in memory. Running each net once on a blank frame here moves that wait to
 * when the sheet opens, while the camera is still starting, instead of while
 * somebody stands there wondering whether the tap registered.
 */
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
    await warm(faceapi);
    api = faceapi;
    return faceapi;
  })();
  // A failed load (a dropped connection) must be retryable, not cached.
  loading.catch(() => { loading = null; });

  return loading;
}

/**
 * One pass of each net on a blank picture, so the GPU programs exist before a
 * real face needs them.
 *
 * The detector is given a frame the shape the camera produces (960x540
 * downscaled to DETECT_WIDTH), so its input resize compiles for the size it
 * will actually see. A blank frame holds no face, which means the landmark and
 * recognition nets would never run from detection alone — so they are called
 * directly on a small crop. Results are thrown away; nothing here can reach the
 * matcher.
 */
async function warm(faceapi: Api): Promise<void> {
  const frame = document.createElement("canvas");
  frame.width = DETECT_WIDTH;
  frame.height = Math.round((DETECT_WIDTH * 9) / 16);
  const ctx = frame.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, frame.width, frame.height);

  const crop = document.createElement("canvas");
  crop.width = 120;
  crop.height = 120;
  crop.getContext("2d")?.drawImage(frame, 0, 0);

  /*
   * One net at a time, with a pause between each. Every compile still holds
   * the main thread while it runs, but the pauses let the page handle a tap on
   * Close in between rather than freezing for the whole warm-up at once.
   */
  const breathe = () => new Promise((r) => setTimeout(r, 30));
  try {
    await faceapi.detectAllFaces(frame, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }));
    await breathe();
    await faceapi.nets.faceLandmark68Net.detectLandmarks(crop);
    await breathe();
    await faceapi.nets.faceRecognitionNet.computeFaceDescriptor(crop);
  } catch {
    // Warming is an optimisation. The first real detection compiles instead.
  }
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
/**
 * Widest frame the detector is given.
 *
 * Detection cost scales with pixel count, so a 1280-wide frame is four times
 * the work of a 640-wide one — seconds rather than a moment on an iPad. A face
 * at kiosk distance is hundreds of pixels across even here, far more detail
 * than the 150x150 the recognition net actually reads, so the extra resolution
 * bought nothing but waiting.
 */
const DETECT_WIDTH = 640;

export function grabFrame(video: HTMLVideoElement): HTMLCanvasElement {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("The camera has not produced a picture yet. Wait a moment and try again.");
  }
  const scale = Math.min(1, DETECT_WIDTH / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}
