// Webcam capture helper for Fit Twin Layer 4.
//
// Flow: open the user's camera stream → let them frame themselves →
// capture a single frame → return a JPEG base64 payload ready for
// the Anthropic Vision API.
//
// All of this is client-side; the stream never leaves the browser
// except as the one captured frame we ship through the agent proxy.

export async function requestCameraStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera API not available in this browser.');
  }
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 960 },
      height: { ideal: 1280 },
    },
    audio: false,
  });
}

export function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((t) => t.stop());
}

/**
 * Capture a JPEG frame from a <video> element.
 * Returns { dataUrl, base64, mediaType }.
 */
export function captureFrame(videoEl, { maxWidth = 720, quality = 0.82 } = {}) {
  if (!videoEl || videoEl.readyState < 2) {
    throw new Error('Camera not ready.');
  }
  const ratio = videoEl.videoHeight / videoEl.videoWidth || 1;
  const w = Math.min(maxWidth, videoEl.videoWidth);
  const h = Math.round(w * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = dataUrl.split(',')[1];
  return { dataUrl, base64, mediaType: 'image/jpeg' };
}

/**
 * Re-encode a user-uploaded image File as a JPEG, regardless of its
 * original format (HEIC, AVIF, WEBP, etc.). The Anthropic vision API
 * only accepts image/jpeg, png, gif, or webp — HEIC and friends blow
 * up on submit. Running every upload through a canvas guarantees a
 * compatible payload.
 *
 * Returns { dataUrl, base64, mediaType, width, height } or throws if
 * the browser can't decode the file (true HEIC on non-Safari, for
 * example).
 */
export async function fileToJpegFrame(
  file,
  { maxWidth = 1080, quality = 0.85 } = {},
) {
  if (!file) throw new Error('No file.');
  // Read into an ObjectURL so decoded dimensions come from the real
  // image, not just MIME type.
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () =>
        reject(
          new Error(
            "This browser couldn't decode that image. Try a JPG, PNG, or WEBP.",
          ),
        );
      i.src = url;
    });
    const ratio = img.naturalHeight / img.naturalWidth || 1;
    const w = Math.min(maxWidth, img.naturalWidth || maxWidth);
    const h = Math.round(w * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.split(',')[1];
    return {
      dataUrl,
      base64,
      mediaType: 'image/jpeg',
      width: w,
      height: h,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
