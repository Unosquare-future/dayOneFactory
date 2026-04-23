// MediaPipe Pose Landmarker — open-source, browser-native body scan.
//
// Loads the 33-keypoint pose model lazily (WASM + .task file fetched
// from Google's CDN — zero runtime infra on our side). Given a captured
// image and the user's known height (inches), we derive:
//   - shoulder_width_in  (landmarks 11 ↔ 12)
//   - torso_length_in    (shoulder midpoint ↔ hip midpoint)
//   - inseam_in          (hip midpoint ↔ ankle midpoint)
//   - arm_length_in      (shoulder ↔ wrist on the stronger-signal side)
//
// The user's height is the physical reference — we normalize the
// pose's nose-to-ankle distance against it and project all other
// landmark distances to inches from there.
//
// Accuracy is rough (±1" typically); the real value is that the
// agent gets a structured fit signal from a single selfie rather than
// nothing.

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let _landmarker = null;
let _initPromise = null;

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/** Lazy-init the pose landmarker. Returns a cached instance. */
export function ensurePoseLandmarker() {
  if (_landmarker) return Promise.resolve(_landmarker);
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    _landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numPoses: 1,
    });
    return _landmarker;
  })();
  return _initPromise;
}

/**
 * Run pose detection on an <img> element (typically the captured frame).
 * Returns { landmarks, frameWidth, frameHeight } or null if no pose.
 */
export async function detectPose(imageEl) {
  const lm = await ensurePoseLandmarker();
  const result = lm.detect(imageEl);
  if (!result || !result.landmarks || result.landmarks.length === 0) {
    return null;
  }
  return {
    landmarks: result.landmarks[0], // array of 33 {x,y,z,visibility}
    frameWidth: imageEl.naturalWidth || imageEl.width,
    frameHeight: imageEl.naturalHeight || imageEl.height,
  };
}

/**
 * Convert normalized-landmark distances into inches using the user's
 * known height as the physical reference.
 *
 * The approach:
 *   - MediaPipe landmarks have x,y in [0,1] range (fraction of image
 *     dimensions). We compute normalized Y distance from nose (landmark
 *     0) to ankle midpoint (27 + 28) as "nose_to_ankle".
 *   - A typical adult's nose sits ~7% below the crown of the head.
 *     So estimated_full_height_in_norm ≈ nose_to_ankle / 0.93.
 *   - scale_inches_per_norm = heightInches / estimated_full_height_in_norm.
 *   - Every other normalized distance * scale = inches.
 *
 * Aspect-ratio note: x and y share the same normalized axis in MediaPipe
 * (they're both fractions of their own dimension). To keep the scale
 * consistent when computing an X-distance we multiply by the frame's
 * aspect ratio (frameWidth / frameHeight) so we're in a shared space.
 */
export function deriveMeasurements(
  pose,
  heightInches,
  { crownAdjustment = 0.93 } = {},
) {
  if (!pose || !pose.landmarks) return null;
  const lm = pose.landmarks;
  const aspect = (pose.frameWidth || 1) / (pose.frameHeight || 1);

  // Convert a landmark pair to a distance in normalized-Y units.
  // y stays as-is; x is scaled by aspect so horizontal + vertical
  // distances can be compared in one unit.
  const dist = (a, b) =>
    Math.hypot(
      (a.x - b.x) * aspect,
      a.y - b.y,
    );

  const nose = lm[0];
  const shL = lm[11];
  const shR = lm[12];
  const hipL = lm[23];
  const hipR = lm[24];
  const ankL = lm[27];
  const ankR = lm[28];
  const wristL = lm[15];
  const wristR = lm[16];

  if (!nose || !shL || !shR || !hipL || !hipR || !ankL || !ankR) return null;

  const shMid = mid(shL, shR);
  const hipMid = mid(hipL, hipR);
  const ankMid = mid(ankL, ankR);

  const noseToAnkle = Math.abs(ankMid.y - nose.y);
  if (noseToAnkle < 0.2) return null; // person not fully in frame

  const fullHeightNorm = noseToAnkle / crownAdjustment;
  const scale = heightInches / fullHeightNorm; // inches per normalized unit

  // Pick whichever side has higher visibility for wrist
  const wrist =
    (wristL?.visibility || 0) >= (wristR?.visibility || 0) ? wristL : wristR;
  const shoulderSide =
    (wristL?.visibility || 0) >= (wristR?.visibility || 0) ? shL : shR;

  const shoulderWidth = dist(shL, shR) * scale;
  const torso = dist(shMid, hipMid) * scale;
  const inseam = dist(hipMid, ankMid) * scale;
  const armLength =
    wrist && shoulderSide ? dist(shoulderSide, wrist) * scale : null;

  return {
    shoulder_width_in: round1(shoulderWidth),
    torso_length_in: round1(torso),
    inseam_in: round1(inseam),
    arm_length_in: armLength != null ? round1(armLength) : null,
    height_reference_in: heightInches,
    confidence: round1(averageVisibility(lm, [0, 11, 12, 23, 24, 27, 28]) * 100),
    method: 'mediapipe-pose-landmarker-lite',
  };
}

function mid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
function round1(n) {
  return Math.round(n * 10) / 10;
}
function averageVisibility(lm, indices) {
  const v = indices.map((i) => lm[i]?.visibility || 0);
  return v.reduce((s, x) => s + x, 0) / v.length;
}
