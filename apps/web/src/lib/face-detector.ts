/**
 * Face presence adapter: prefers the native Shape Detection FaceDetector
 * (Chrome/Edge), with a lazy MediaPipe BlazeFace fallback for other browsers.
 */

export interface FacePresenceDetector {
  detect(video: HTMLVideoElement): Promise<boolean>;
  close(): void;
}

const MEDIAPIPE_VERSION = "0.10.21";
const MEDIAPIPE_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MEDIAPIPE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

/** Minimal typing for the experimental Shape Detection API. */
interface NativeFaceDetector {
  detect(image: ImageBitmapSource): Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
}

interface NativeFaceDetectorConstructor {
  new (options?: { maxDetectedFaces?: number; fastMode?: boolean }): NativeFaceDetector;
}

function getNativeFaceDetectorCtor(): NativeFaceDetectorConstructor | null {
  const ctor = (globalThis as unknown as { FaceDetector?: NativeFaceDetectorConstructor })
    .FaceDetector;
  return typeof ctor === "function" ? ctor : null;
}

function createNativeDetector(): FacePresenceDetector | null {
  const Ctor = getNativeFaceDetectorCtor();
  if (!Ctor) return null;

  try {
    const detector = new Ctor({ maxDetectedFaces: 1, fastMode: true });
    return {
      async detect(video) {
        if (video.readyState < 2 || video.videoWidth === 0) return false;
        try {
          const faces = await detector.detect(video);
          return faces.length > 0;
        } catch {
          return false;
        }
      },
      close() {
        // Native FaceDetector has no dispose API.
      },
    };
  } catch {
    return null;
  }
}

async function createMediaPipeDetector(): Promise<FacePresenceDetector> {
  const { FilesetResolver, FaceDetector } = await import("@mediapipe/tasks-vision");
  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);

  async function create(delegate: "GPU" | "CPU") {
    return FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MEDIAPIPE_MODEL,
        delegate,
      },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.5,
    });
  }

  let detector;
  try {
    detector = await create("GPU");
  } catch {
    detector = await create("CPU");
  }

  let lastTimestamp = -1;

  return {
    async detect(video) {
      if (video.readyState < 2 || video.videoWidth === 0) return false;
      try {
        // MediaPipe VIDEO mode requires a strictly increasing timestamp.
        let timestamp = performance.now();
        if (timestamp <= lastTimestamp) {
          timestamp = lastTimestamp + 1;
        }
        lastTimestamp = timestamp;
        const result = detector.detectForVideo(video, timestamp);
        return (result.detections?.length ?? 0) > 0;
      } catch {
        return false;
      }
    },
    close() {
      try {
        detector.close();
      } catch {
        // ignore
      }
    },
  };
}

/**
 * Create the best available face presence detector for this browser.
 * Native Shape Detection is preferred; MediaPipe is loaded only when needed.
 */
export async function createFaceDetector(): Promise<FacePresenceDetector> {
  const native = createNativeDetector();
  if (native) return native;
  return createMediaPipeDetector();
}
