import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyChannel,
  getStreamingUrls,
  createStream,
  startStream,
  stopStream,
  getSubscriptionStatus,
  subscribe as apiSubscribe,
} from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [streamingUrls, setStreamingUrls] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [streamTitle, setStreamTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [channelRes, urlsRes, subRes] = await Promise.all([
        getMyChannel(),
        getStreamingUrls(),
        getSubscriptionStatus(),
      ]);
      setChannel(channelRes.data);
      setStreamingUrls(urlsRes.data);
      setSubscription(subRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoLive = async () => {
    if (!streamTitle.trim()) return alert('Enter a stream title');
    try {
      const res = await createStream({ title: streamTitle });
      const stream = res.data;
      await startStream(stream.id);
      setCurrentStream({ ...stream, status: 'LIVE' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start stream');
    }
  };

  const handleStopStream = async () => {
    if (!currentStream) return;
    try {
      await stopStream(currentStream.id);
      setCurrentStream(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to stop stream');
    }
  };

  const handleSubscribe = async () => {
    try {
      await apiSubscribe();
      const subRes = await getSubscriptionStatus();
      setSubscription(subRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Subscription failed');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      {/* Channel Info */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📺 Your Channel</h3>
        <p><strong>Name:</strong> {channel?.name}</p>
        <p>
          <strong>Stream Key:</strong>{' '}
          {showKey ? channel?.streamKey : '••••••••••••••••'}
          <button onClick={() => setShowKey(!showKey)} style={styles.toggleBtn}>
            {showKey ? 'Hide' : 'Show'}
          </button>
        </p>
      </div>

      {/* OBS Config */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🔧 OBS Settings</h3>
        <p><strong>Server:</strong> <code>rtmp://localhost/live</code></p>
        <p><strong>Stream Key:</strong> <code>{showKey ? channel?.streamKey : '(click Show above)'}</code></p>
      </div>

      {/* Stream Control */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🔴 Go Live</h3>
        {currentStream ? (
          <div>
            <p style={{ color: '#4ecca3' }}>● LIVE — "{currentStream.title}"</p>
            <p><strong>Playback:</strong> <code>{streamingUrls?.playbackUrl}</code></p>
            <button onClick={handleStopStream} style={{ ...styles.btn, background: '#c0392b' }}>
              Stop Stream
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              placeholder="Stream title"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleGoLive} style={styles.btn}>
              Go Live
            </button>
          </div>
        )}
      </div>

      {/* Subscription */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>⭐ Subscription</h3>
        <p>
          <strong>Plan:</strong>{' '}
          <span style={{ color: subscription?.plan === 'PAID' ? '#4ecca3' : '#e94560' }}>
            {subscription?.plan}
          </span>
        </p>
        {subscription?.expiresAt && (
          <p><strong>Expires:</strong> {new Date(subscription.expiresAt).toLocaleDateString()}</p>
        )}
        {subscription?.plan === 'FREE' && (
          <button onClick={handleSubscribe} style={styles.btn}>
            Upgrade to PAID (30 days)
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
  },
  title: { color: '#fff', marginBottom: '24px' },
  card: {
    background: '#16213e',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '16px',
    color: '#ccc',
  },
  cardTitle: { color: '#e94560', margin: '0 0 12px 0' },
  input: {
    flex: 1,
    padding: '10px 14px',
    background: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  btn: {
    padding: '10px 20px',
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  toggleBtn: {
    marginLeft: '8px',
    padding: '2px 8px',
    background: 'transparent',
    border: '1px solid #666',
    borderRadius: '3px',
    color: '#999',
    cursor: 'pointer',
    fontSize: '12px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px',
    color: '#999',
    fontSize: '18px',
  },
};
