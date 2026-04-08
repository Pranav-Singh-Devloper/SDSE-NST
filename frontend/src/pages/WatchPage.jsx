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

  // Countdown timer for free users
  useEffect(() => {
    if (!viewingAccess?.maxDurationSeconds) return;

    setTimeLeft(viewingAccess.maxDurationSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
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

  if (loading) return <div style={styles.loading}>Loading stream...</div>;
  if (!stream) return <div style={styles.loading}>Stream not found</div>;

  // Get HLS URL from stream's channel streamKey
  const hlsUrl = stream.channel?.streamKey
    ? `${HLS_BASE}/${stream.channel.streamKey}.m3u8`
    : null;

  const isTimedOut = timeLeft !== null && timeLeft <= 0;

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Video Section */}
        <div style={styles.videoSection}>
          {isTimedOut ? (
            <div style={styles.timedOut}>
              <h2>⏰ Free viewing time expired</h2>
              <p>Upgrade to PAID for unlimited viewing</p>
            </div>
          ) : (
            <VideoPlayer src={stream.status === 'LIVE' ? hlsUrl : null} />
          )}

          {/* Stream Info */}
          <div style={styles.streamInfo}>
            <h2 style={styles.streamTitle}>{stream.title}</h2>
            <div style={styles.streamMeta}>
              <span style={{
                color: stream.status === 'LIVE' ? '#4ecca3' : '#666',
                fontWeight: 'bold',
              }}>
                {stream.status === 'LIVE' ? '● LIVE' : `○ ${stream.status}`}
              </span>
              <span>by {stream.channel?.user?.name || 'Unknown'}</span>
            </div>

            {/* Free tier warning */}
            {timeLeft !== null && timeLeft > 0 && (
              <div style={styles.timerBanner}>
                ⏱️ Free tier — Time remaining: {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div style={styles.chatSection}>
          <ChatBox streamId={streamId} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  mainContent: {
    display: 'flex',
    gap: '16px',
    height: 'calc(100vh - 120px)',
  },
  videoSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  streamInfo: {
    padding: '16px 0',
  },
  streamTitle: {
    color: '#fff',
    margin: '0 0 8px 0',
    fontSize: '20px',
  },
  streamMeta: {
    display: 'flex',
    gap: '16px',
    color: '#999',
    fontSize: '14px',
  },
  timerBanner: {
    marginTop: '12px',
    padding: '8px 16px',
    background: '#e94560',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  chatSection: {
    width: '350px',
    flexShrink: 0,
  },
  timedOut: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    background: '#1a1a2e',
    borderRadius: '8px',
    color: '#e94560',
    textAlign: 'center',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px',
    color: '#999',
    fontSize: '18px',
  },
};
