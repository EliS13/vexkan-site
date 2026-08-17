"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Opening the camera, in a way iOS actually permits.
 *
 * Safari on iPhone and iPad refuses getUserMedia unless the call happens inside
 * a user gesture. Starting the camera from an effect on mount — which is what
 * desktop Chrome tolerates — is rejected there before the permission sheet is
 * ever shown, so the page looks broken rather than unpermitted. Everything here
 * is therefore driven by an explicit `start()` the UI must call from onClick.
 *
 * Safari also only prompts on a secure origin. localhost counts; a phone
 * hitting a dev server over the LAN by IP does not, which is its own confusing
 * silent failure and is called out below.
 */

export type CameraStatus = "idle" | "starting" | "live" | "denied" | "unavailable" | "insecure";

/*
 * Set once the camera has actually opened on this device.
 *
 * The Permissions API would be the obvious way to ask "am I allowed already",
 * but Safari does not answer for the camera, and Safari is the whole target
 * here. So: remember that it worked, then optimistically try again next time
 * and fall back to asking if that fails. Trying and recovering is reliable
 * where querying is not.
 */
const GRANTED_KEY = "vexkan.kiosk.camera.granted";

export type Facing = "user" | "environment";

export type CameraState = {
  /**
   * Callback ref for the <video> element. A callback rather than a RefObject on
   * purpose: React 19 forbids reading or mutating a ref during render, and
   * handing a RefObject out of a hook and down into a child trips that rule.
   * A callback ref is assigned by React itself and sidesteps it entirely.
   */
  attach: (el: HTMLVideoElement | null) => void;
  /** The live element, for callers that need to grab a frame. Never read during render. */
  getVideo: () => HTMLVideoElement | null;
  status: CameraStatus;
  /** Ready to explain to a twelve year old, not a stack trace. */
  message: string | null;
  start: () => Promise<void>;
  /**
   * Opens the camera without a tap, for a device that has allowed it before.
   * Silent: a refusal leaves the gate showing its normal invitation rather than
   * an error, because needing a gesture is not the same as being blocked.
   */
  resume: () => Promise<void>;
  /** Front or rear. The rear camera is how an organizer photographs a group. */
  facing: Facing;
  /** Swaps cameras, keeping the stream open. Null while only one exists. */
  flip: (() => Promise<void>) | null;
  stop: () => void;
};

function secureEnough(): boolean {
  if (typeof window === "undefined") return true;
  return window.isSecureContext || window.location.hostname === "localhost";
}

/*
 * The hook owns the <video> ref rather than being handed one. React treats a
 * ref arriving as a prop as something it must not mutate, and this needs to
 * assign srcObject and call play() on it.
 */
export function useCamera(): CameraState {
  const video = useRef<HTMLVideoElement | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [facing, setFacing] = useState<Facing>("user");
  const [hasSeveral, setHasSeveral] = useState(false);
  /* Every video input, so switching can name one rather than describe it. */
  const cameras = useRef<MediaDeviceInfo[]>([]);
  const currentDeviceId = useRef<string | null>(null);

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setStatus("idle");
  }, []);

  // Release the camera when the component goes away, so the indicator light
  // does not stay on and a later page can open it again.
  useEffect(() => () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const open = useCallback(async (silent: boolean, want: Facing = "user", deviceId?: string) => {
    if (!secureEnough()) {
      if (silent) return;
      setStatus("insecure");
      setMessage(
        "The camera only works over https. Open this page at its real address rather than by IP.",
      );
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      if (silent) return;
      setStatus("unavailable");
      setMessage("This browser cannot use the camera. Safari or Chrome will.");
      return;
    }

    setStatus("starting");
    setMessage(null);

    /*
     * Release the current camera before asking for the other one. iOS will not
     * open a second capture device while the first is streaming — the request
     * fails with NotReadableError — so acquiring first and stopping after, which
     * works on desktop, never switched at all on an iPad.
     */
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        /*
         * `ideal` rather than `exact`: an iPad in a case with a blocked front
         * camera, or a Mac with only an external webcam, still gets a stream
         * instead of an OverconstrainedError.
         */
        /*
         * 960 rather than 1280. Frames are downscaled to 640 for detection
         * anyway, so a larger stream only costs the iPad decode work and
         * memory on every frame it draws.
         */
        /*
         * A device id when we have one, because facingMode is only a hint:
         * Safari may quietly return the front camera for "environment", so the
         * mirror flips while the picture does not. An id is unambiguous.
         */
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 960 }, height: { ideal: 540 } }
          : { facingMode: want, width: { ideal: 960 }, height: { ideal: 540 } },
        audio: false,
      });
      stream.current = media;

      /*
       * Believe the track, not the request. Its own settings say which camera
       * actually opened, which is what the preview's mirroring must follow.
       */
      const track = media.getVideoTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      currentDeviceId.current = settings.deviceId ?? deviceId ?? null;
      const reported = settings.facingMode as Facing | undefined;
      const byLabel = /back|rear|environment/i.test(track?.label ?? "")
        ? "environment"
        : /front|face/i.test(track?.label ?? "")
          ? "user"
          : undefined;
      setFacing(reported ?? byLabel ?? want);
      if (video.current) {
        video.current.srcObject = media;
        // iOS needs both of these set before play() or it opens fullscreen.
        video.current.setAttribute("playsinline", "true");
        video.current.muted = true;
        await video.current.play();
        /*
         * play() resolves before the first frame has decoded, so videoWidth can
         * still be 0. Capturing then yields a 0x0 canvas, the detector finds
         * nothing, and the user is told "no face in frame" while looking
         * straight at it. Waiting for real dimensions is the difference between
         * the capture button working and silently doing nothing.
         */
        await waitForFrames(video.current);
      }
      setStatus("live");
      /*
       * Only ask what cameras exist once permission is granted. Before that,
       * browsers report unlabelled placeholder devices — or nothing — so a
       * flip button would appear on a phone with one camera and not on an
       * iPad with two.
       */
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras.current = devices.filter((d) => d.kind === "videoinput");
        setHasSeveral(cameras.current.length > 1);
      } catch {
        setHasSeveral(false);
      }
      try {
        window.localStorage.setItem(GRANTED_KEY, "1");
      } catch {
        // Private browsing. The gate simply keeps asking, which still works.
      }
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (silent) {
        /*
         * A silent attempt that fails proves nothing: the browser may only want
         * a gesture. Fall back to the invitation rather than telling someone
         * their camera is blocked when it is not.
         */
        setStatus("idle");
        return;
      }
      setStatus(name === "NotAllowedError" ? "denied" : "unavailable");
      setMessage(explain(name));
    }
  }, []);

  const start = useCallback(() => open(false), [open]);

  const flip = useCallback(async () => {
    const list = cameras.current;
    const other: Facing = facing === "user" ? "environment" : "user";

    // Next camera in the list, wrapping. On a two-camera iPad that is simply
    // the other one, and it is named rather than described.
    let target: string | undefined;
    if (list.length > 1) {
      const at = list.findIndex((d) => d.deviceId === currentDeviceId.current);
      target = list[(at + 1) % list.length]?.deviceId || undefined;
    }

    await open(false, other, target);

    // Refused, or there was no id to use: try describing it instead, then give
    // the working camera back rather than leaving a dead panel.
    if (!stream.current) await open(true, other);
    if (!stream.current) await open(true, facing, currentDeviceId.current ?? undefined);
  }, [open, facing]);

  const resume = useCallback(async () => {
    let remembered = false;
    try {
      remembered = window.localStorage.getItem(GRANTED_KEY) === "1";
    } catch {
      remembered = false;
    }
    if (remembered) await open(true);
  }, [open]);

  const attach = useCallback((el: HTMLVideoElement | null) => {
    video.current = el;
    // A stream that arrived before the element mounted still needs connecting.
    if (el && stream.current && el.srcObject !== stream.current) {
      el.srcObject = stream.current;
      el.muted = true;
      el.setAttribute("playsinline", "true");
      void el.play().catch(() => {});
    }
  }, []);

  const getVideo = useCallback(() => video.current, []);

  return { attach, getVideo, status, message, start, resume, facing, flip: hasSeveral ? flip : null, stop };
}

/** Resolves once the element reports real dimensions, or gives up after 5s. */
function waitForFrames(el: HTMLVideoElement): Promise<void> {
  if (el.videoWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const deadline = Date.now() + 5000;
    const tick = () => {
      if (el.videoWidth > 0 || Date.now() > deadline) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
}

/** Each of these has a different fix, so they get different words. */
function explain(name: string): string {
  switch (name) {
    case "NotAllowedError":
      return "Camera access was blocked. On an iPad: Settings, Safari, Camera, set it to Allow — or tap the ⚙ in the address bar and allow it for this site.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera was found on this device.";
    case "NotReadableError":
      return "Another app is already using the camera. Close it and try again.";
    case "SecurityError":
      return "The browser blocked the camera on this page. It needs to be loaded over https.";
    default:
      return "The camera could not be started. An organizer can sign people in with the passcode instead.";
  }
}
