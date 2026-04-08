import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }
  }, [src]);

  return (
    <div style={styles.container}>
      <video
        ref={videoRef}
        controls
        style={styles.video}
        playsInline
      />
      {!src && (
        <div style={styles.placeholder}>
          <p>No stream available</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    background: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    display: 'block',
  },
  placeholder: {
    padding: '60px',
    textAlign: 'center',
    color: '#666',
  },
};
