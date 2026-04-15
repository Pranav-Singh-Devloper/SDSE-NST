import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(false);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError(true);
      });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }
  }, [src]);

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden">
      {/* 16:9 aspect-ratio container */}
      <div className="relative w-full aspect-video bg-black">

        {src && !error ? (
          <video
            ref={videoRef}
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0d0d] text-[#555]">
            <span className="text-5xl opacity-60">
              {error ? '⚠️' : '📡'}
            </span>
            <p className="text-sm font-medium">
              {error ? 'Stream unavailable right now' : 'Stream is not live yet'}
            </p>
          </div>
        )}

        {/* LIVE badge — top-left overlay */}
        {src && !error && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-700/90 backdrop-blur-sm text-white text-[11px] font-bold tracking-widest px-2.5 py-1 rounded pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-[livePulse_1.2s_ease-in-out_infinite]" />
            LIVE
          </div>
        )}
      </div>
    </div>
  );
}
