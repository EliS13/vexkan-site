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

  const start = useCallback(async () => {
    if (!secureEnough()) {
      setStatus("insecure");
      setMessage(
        "The camera only works over https. Open this page at its real address rather than by IP.",
      );
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setMessage("This browser cannot use the camera. Safari or Chrome will.");
      return;
    }

    setStatus("starting");
    setMessage(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        /*
         * `ideal` rather than `exact`: an iPad in a case with a blocked front
         * camera, or a Mac with only an external webcam, still gets a stream
         * instead of an OverconstrainedError.
         */
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      stream.current = media;
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
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      setStatus(name === "NotAllowedError" ? "denied" : "unavailable");
      setMessage(explain(name));
    }
  }, []);

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

  return { attach, getVideo, status, message, start, stop };
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
