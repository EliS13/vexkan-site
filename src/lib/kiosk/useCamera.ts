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
  /** Swaps cameras. Reports a refusal rather than failing silently. */
  flip: () => Promise<void>;
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

  const open = useCallback(async (
    silent: boolean,
    want: Facing = "user",
    constraint?: MediaTrackConstraints,
  ) => {
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
        video: {
          ...(constraint ?? { facingMode: want }),
          width: { ideal: 960 },
          height: { ideal: 540 },
        },
        audio: false,
      });
      stream.current = media;

      /*
       * Believe the track, not the request. Its own settings say which camera
       * actually opened, which is what the preview's mirroring must follow.
       */
      const track = media.getVideoTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      currentDeviceId.current = settings.deviceId ?? null;
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

  /**
   * Switches cameras, trying each mechanism browsers actually honour.
   *
   * There is no single reliable one. `facingMode: "environment"` is advisory —
   * Safari may return the front camera anyway, so the mirror flips while the
   * picture does not. `{ exact: "environment" }` is binding but throws where
   * unsupported. A device id is unambiguous but iOS does not always enumerate
   * both cameras, and its ids are not stable between sessions. So: try the
   * binding form, then the id, then the hint, and stop at whichever produces a
   * camera that is genuinely different from the one already open.
   */
  const flip = useCallback(async () => {
    const other: Facing = facing === "user" ? "environment" : "user";
    const wasDevice = currentDeviceId.current;
    const wasFacing = facing;

    const list = cameras.current;
    const at = list.findIndex((d) => d.deviceId === wasDevice);
    const nextId = list.length > 1 ? list[(at + 1) % list.length]?.deviceId : undefined;

    const attempts: MediaTrackConstraints[] = [
      { facingMode: { exact: other } },
      ...(nextId ? [{ deviceId: { exact: nextId } } as MediaTrackConstraints] : []),
      { facingMode: other },
    ];

    for (const attempt of attempts) {
      await open(true, other, attempt);
      // Changed camera only if the device actually differs. A hint that was
      // ignored reopens the same one, which is a failure wearing a success.
      if (stream.current && currentDeviceId.current !== wasDevice) return;
    }

    // Nothing worked. Put the original back rather than leave a dead panel.
    await open(true, wasFacing, wasDevice ? { deviceId: { exact: wasDevice } } : undefined);
    setMessage("This device would not switch cameras.");
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

  /*
   * Offered whenever the camera is open, not only when two were enumerated.
   * iOS does not always list both, so gating on the count hid the control on
   * exactly the devices that needed it. A refusal is reported instead.
   */
  void hasSeveral;
  return { attach, getVideo, status, message, start, resume, facing, flip, stop };
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
