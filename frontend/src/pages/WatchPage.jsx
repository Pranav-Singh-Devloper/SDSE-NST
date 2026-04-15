import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStreamDetails, getViewingAccess } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import ChatBox from '../components/ChatBox';

const HLS_BASE = 'http://localhost:8080/hls';

export default function WatchPage() {
  const { streamId } = useParams();
  const [stream, setStream] = useState(null);
  const [viewingAccess, setViewingAccess] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStream();
    loadViewingAccess();
  }, [streamId]);

  useEffect(() => {
    if (!viewingAccess?.maxDurationSeconds) return;
    setTimeLeft(viewingAccess.maxDurationSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [viewingAccess]);

  const loadStream = async () => {
    try {
      const res = await getStreamDetails(streamId);
      setStream(res.data);
    } catch (err) {
      console.error('Failed to load stream', err);
    } finally {
      setLoading(false);
    }
  };

  const loadViewingAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await getViewingAccess();
      setViewingAccess(res.data);
    } catch (err) {
      console.error('Failed to check viewing access', err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-4 bg-yt-bg text-[#aaa]">
        <div className="w-10 h-10 border-[3px] border-[#272727] border-t-yt-red rounded-full animate-spin" />
        <span className="text-base">Loading stream…</span>
      </div>
    );
  }

  /* ── Not found ── */
  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-3 bg-yt-bg text-[#aaa] text-base">
        <span className="text-5xl">🎬</span>
        <span>Stream not found</span>
      </div>
    );
  }

  const hlsUrl = stream.channel?.streamKey
    ? `${HLS_BASE}/${stream.channel.streamKey}.m3u8`
    : null;

  const isLive = stream.status === 'LIVE';
  const isTimedOut = timeLeft !== null && timeLeft <= 0;
  const avatarLetter = (stream.channel?.user?.name || 'U')[0].toUpperCase();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-yt-bg text-white px-4 md:px-6 py-4 pb-12 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Video + Info ── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Video or Timeout screen */}
          {isTimedOut ? (
            <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-[#0d0d0d] rounded-xl text-center">
              <span className="text-5xl">⏰</span>
              <h2 className="text-xl font-bold text-white">Free viewing time expired</h2>
              <p className="text-sm text-[#aaa]">
                Upgrade to <span className="text-yt-red font-semibold">PAID</span> for unlimited access
              </p>
            </div>
          ) : (
            <VideoPlayer src={isLive ? hlsUrl : null} />
          )}

          {/* Free tier timer banner */}
          {timeLeft !== null && timeLeft > 0 && (
            <div className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-red-900/20 border border-red-800/40 rounded-lg text-red-400 text-sm">
              <span>⏱</span>
              <span>
                Free tier — Time remaining:&nbsp;
                <strong className="text-red-300">{formatTime(timeLeft)}</strong>
              </span>
            </div>
          )}

          {/* Stream info */}
          <div className="mt-3.5">
            {/* Title */}
            <h1 className="text-[19px] font-bold leading-snug text-white mb-3">
              {stream.title}
            </h1>

            {/* Channel row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yt-red to-red-400 flex items-center justify-center text-white font-bold text-base shrink-0">
                  {avatarLetter}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-white">
                    {stream.channel?.user?.name || 'Unknown streamer'}
                  </span>
                  <span className="text-xs text-[#aaa]">Channel</span>
                </div>
              </div>

              {/* Status badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                isLive
                  ? 'bg-yt-red text-white'
                  : 'bg-[#272727] text-[#aaa]'
              }`}>
                {isLive ? '● LIVE' : `○ ${stream.status}`}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#272727] my-4" />

            {/* Description box */}
            <div className="bg-[#1a1a1a] rounded-lg px-4 py-3">
              <p className="text-sm text-[#aaa]">
                {isLive ? 'This stream is currently live' : 'Stream is not active right now'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Chat Panel ── */}
        <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-[72px] h-[420px] lg:h-[calc(100vh-80px)]">
          <ChatBox streamId={streamId} />
        </div>

      </div>
    </div>
  );
}
