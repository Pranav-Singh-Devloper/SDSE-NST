import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001/chat';

const NAME_COLORS = [
  '#ff6e6e','#ffb347','#7ec8e3','#a8e6cf',
  '#dda0dd','#87ceeb','#f0e68c','#98fb98',
  '#ffa07a','#20b2aa',
];

function getNameColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return NAME_COLORS[hash % NAME_COLORS.length];
}

export default function ChatBox({ streamId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!streamId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => { setConnected(true); socket.emit('joinRoom', { streamId }); });
    socket.on('disconnect', () => setConnected(false));
    socket.on('existingMessages', (msgs) => setMessages(msgs));
    socket.on('newMessage', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('streamEnded', () => {
      setMessages((prev) => [...prev, {
        id: 'system-end',
        content: 'Stream has ended',
        user: { name: 'System' },
        isSystem: true,
        createdAt: new Date().toISOString(),
      }]);
    });

    return () => { socket.emit('leaveRoom', { streamId }); socket.disconnect(); };
  }, [streamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !user.id) return;
    socketRef.current.emit('sendMessage', { streamId, userId: user.id, content: input.trim() });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] border border-[#272727] rounded-xl overflow-hidden font-sans">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-[#272727] shrink-0">
        <span className="text-white text-sm font-semibold tracking-tight">Live Chat</span>
        <span className={`text-xs font-medium ${connected ? 'text-green-500' : 'text-[#555]'}`}>
          {connected ? '● Connected' : '○ Offline'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 flex flex-col gap-0.5 scroll-smooth [scrollbar-width:thin]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#555] text-sm">
            <span className="text-3xl">👋</span>
            <p>Be the first to say something!</p>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.isSystem ? (
            <div key={msg.id || i} className="text-center text-xs text-[#555] italic my-2">
              {msg.content}
            </div>
          ) : (
            <div
              key={msg.id || i}
              className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 px-1.5 py-1 rounded hover:bg-white/[0.04] transition-colors"
            >
              <span
                className="text-[13px] font-bold shrink-0 cursor-default select-none"
                style={{ color: getNameColor(msg.user?.name) }}
              >
                {msg.user?.name || 'Anon'}
              </span>
              <span className="text-[13px] text-[#e3e3e3] break-words">
                {msg.content}
              </span>
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 px-3 py-2.5 border-t border-[#272727] bg-[#111] shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={user.id ? 'Say something...' : 'Sign in to chat'}
          disabled={!user.id}
          maxLength={300}
          className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-full text-white text-[13px] outline-none placeholder-[#555] focus:border-[#555] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!user.id || !input.trim()}
          className="w-9 h-9 flex items-center justify-center bg-yt-red hover:bg-yt-redhov text-white rounded-full text-base shrink-0 transition-all active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
