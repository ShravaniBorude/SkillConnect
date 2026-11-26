import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { chatApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getInitials, timeSince } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import { Send, MessageCircle } from 'lucide-react';

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(conversationId ? Number(conversationId) : null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      const list = res.data.data || [];
      setConversations(list);
      if (!activeId && list.length > 0) {
        setActiveId(list[0].id);
      }
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (conversationId) setActiveId(Number(conversationId));
  }, [conversationId]);

  useEffect(() => {
    if (!activeId) return;
    chatApi.getMessages(activeId, { page: 0, size: 50 })
      .then((res) => {
        const msgs = res.data.data?.content || [];
        setMessages([...msgs].reverse());
        chatApi.markRead(activeId).catch(() => {});
      })
      .catch(() => setMessages([]));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useWebSocket(token, activeId ? [
    {
      destination: `/topic/conversations/${activeId}`,
      callback: (msg) => {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      },
    },
  ] : []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeId) return;
    const text = input.trim();
    setInput('');
    try {
      const res = await chatApi.sendMessage(activeId, { content: text, messageType: 'TEXT' });
      const saved = res.data.data;
      setMessages((prev) => (prev.some((m) => m.id === saved.id) ? prev : [...prev, saved]));
    } catch {
      setInput(text);
    }
  };

  const getOtherParticipant = (c) => {
    if (c.participantOneId === user?.id) {
      return { name: c.participantTwoName, avatar: c.participantTwoAvatar };
    }
    return { name: c.participantOneName, avatar: c.participantOneAvatar };
  };

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <DashboardLayout>
      <div className="card p-0 overflow-hidden h-[calc(100vh-10rem)] flex">
        {/* Conversations list */}
        <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="font-semibold text-slate-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <Spinner className="py-10" />
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No conversations yet.</div>
            ) : (
              conversations.map((c) => {
                const other = getOtherParticipant(c);
                const selected = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setActiveId(c.id); navigate(`/chat/${c.id}`); }}
                    className={`w-full text-left p-3.5 flex items-center gap-3 hover:bg-slate-100 transition ${selected ? 'bg-brand-50' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {getInitials(other.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 truncate">{other.name}</span>
                        {c.lastMessageAt && <span className="text-[11px] text-slate-400">{timeSince(c.lastMessageAt)}</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessagePreview || 'Start chatting...'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                  {getInitials(getOtherParticipant(activeConv).name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{getOtherParticipant(activeConv).name}</h3>
                  {activeConv.contractId && <p className="text-xs text-slate-400">Contract #{activeConv.contractId}</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {messages.map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-brand-100' : 'text-slate-400'}`}>
                          {timeSince(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary px-4">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageCircle className="h-12 w-12 mb-2 text-slate-300" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
