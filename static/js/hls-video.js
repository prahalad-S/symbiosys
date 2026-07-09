/**
 * HLS video player utility
 */
export async function initHlsVideo(videoEl, videoSrc) {
  if (!videoEl || !videoSrc) return null;

  const Hls = window.Hls;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hls.loadSource(videoSrc);
    hls.attachMedia(videoEl);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoEl.play().catch(() => {});
    });
    return hls;
  }

  if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = videoSrc;
    videoEl.addEventListener('loadedmetadata', () => {
      videoEl.play().catch(() => {});
    });
  }

  return null;
}

export function initBackgroundVideos() {
  document.querySelectorAll('[data-hls-src]').forEach(async (video) => {
    const src = video.getAttribute('data-hls-src');
    if (src) await initHlsVideo(video, src);
  });
}
