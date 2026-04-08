import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001/chat';

export default function ChatBox({ streamId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!streamId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', { streamId });
    });

    socket.on('existingMessages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('streamEnded', () => {
      setMessages((prev) => [...prev, {
        id: 'system-end',
        content: '--- Stream has ended ---',
        user: { name: 'System' },
        createdAt: new Date().toISOString(),
      }]);
    });

    return () => {
      socket.emit('leaveRoom', { streamId });
      socket.disconnect();
    };
  }, [streamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !user.id) return;

    socketRef.current.emit('sendMessage', {
      streamId,
      userId: user.id,
      content: input.trim(),
    });
    setInput('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>💬 Live Chat</div>
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={msg.id || i} style={styles.message}>
            <strong style={styles.username}>{msg.user?.name || 'Anon'}</strong>
            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={styles.form}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={user.id ? 'Type a message...' : 'Login to chat'}
          disabled={!user.id}
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn} disabled={!user.id}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#16213e',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    padding: '10px 16px',
    background: '#1a1a2e',
    color: '#e94560',
    fontWeight: 'bold',
    borderBottom: '1px solid #333',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  message: {
    fontSize: '13px',
    color: '#ccc',
  },
  username: {
    color: '#e94560',
    marginRight: '8px',
    fontSize: '13px',
  },
  form: {
    display: 'flex',
    padding: '8px',
    gap: '8px',
    borderTop: '1px solid #333',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    background: '#0f3460',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
  },
  sendBtn: {
    padding: '8px 16px',
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
};
