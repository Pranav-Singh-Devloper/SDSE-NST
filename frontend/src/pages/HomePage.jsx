import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLiveStreams } from '../services/api';

export default function HomePage() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreams();
    // Poll for new streams every 10 seconds
    const interval = setInterval(loadStreams, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStreams = async () => {
    try {
      const res = await getLiveStreams();
      setStreams(res.data);
    } catch (err) {
      console.error('Failed to load streams', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading live streams...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔴 Live Streams</h1>

      {streams.length === 0 ? (
        <div style={styles.empty}>
          <p>No live streams right now.</p>
          <p style={{ color: '#666' }}>Be the first to go live!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {streams.map((stream) => (
            <Link
              key={stream.id}
              to={`/watch/${stream.id}`}
              style={styles.card}
            >
              <div style={styles.thumbnail}>
                <span style={styles.liveBadge}>● LIVE</span>
              </div>
              <div style={styles.cardInfo}>
                <h3 style={styles.cardTitle}>{stream.title}</h3>
                <p style={styles.cardChannel}>
                  {stream.channel?.user?.name || 'Unknown'} — {stream.channel?.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  title: { color: '#fff', marginBottom: '24px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#16213e',
    borderRadius: '8px',
    overflow: 'hidden',
    textDecoration: 'none',
    transition: 'transform 0.2s',
  },
  thumbnail: {
    height: '170px',
    background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: '10px',
  },
  liveBadge: {
    background: '#e94560',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: '14px',
  },
  cardTitle: {
    color: '#fff',
    margin: '0 0 6px 0',
    fontSize: '16px',
  },
  cardChannel: {
    color: '#999',
    margin: 0,
    fontSize: '13px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#999',
    fontSize: '18px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px',
    color: '#999',
    fontSize: '18px',
  },
};
