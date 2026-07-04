import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api/index.js';
import { getSocket } from '../api/socket.js';
import { getClientId } from '../utils/identity.js';
import { useChatProfile } from '../components/CommunityLayout.jsx';
import { timeAgoUrdu, toUrduNumber } from '../utils/format.js';
import Loader from '../components/Loader.jsx';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-sky-500', 'bg-indigo-500', 'bg-fuchsia-500',
];
function colorFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
const initial = (name = '?') => name.trim().charAt(0) || '؟';

// Merge a neutral broadcast ([{emoji,count}]) into existing reactions, keeping
// this browser's own `mine` flags.
function mergeReactions(prev = [], incoming = []) {
  return incoming.map((g) => {
    const old = prev.find((o) => o.emoji === g.emoji);
    return { ...g, mine: old?.mine || false };
  });
}

function ChatRow({ msg, mine, onReply, onReact }) {
  const [picker, setPicker] = useState(false);
  return (
    <div className="group flex gap-2.5 px-1 py-1.5 hover:bg-gray-50">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${colorFor(
          msg.authorName
        )}`}
      >
        {initial(msg.authorName)}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`inline-block max-w-full rounded-2xl px-3 py-2 shadow-sm ${
            mine ? 'bg-brand/10' : 'bg-gray-100'
          }`}
        >
          {msg.replyTo && (
            <div className="urdu mb-1 truncate border-r-2 border-brand/40 bg-black/5 px-2 py-0.5 text-xs text-gray-500">
              <span className="font-semibold">{msg.replyTo.authorName}:</span> {msg.replyTo.content}
            </div>
          )}

          <div className="urdu flex flex-wrap items-baseline gap-x-2 leading-relaxed">
            <span className={`text-sm font-bold ${mine ? 'text-brand' : 'text-ink'}`}>
              {msg.authorName}
            </span>
            <span className="text-[11px] text-gray-400">{timeAgoUrdu(msg.createdAt)}</span>
          </div>
          <p className="urdu whitespace-pre-wrap break-words text-[15px] text-gray-800">{msg.content}</p>
        </div>

        {/* reactions + hover actions */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {msg.reactions?.map((r) => (
            <button
              key={r.emoji}
              onClick={() => onReact(msg._id, r.emoji)}
              className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition ${
                r.mine ? 'border-brand bg-brand/10 text-brand' : 'border-gray-200 bg-white hover:bg-gray-100'
              }`}
            >
              <span>{r.emoji}</span>
              <span>{toUrduNumber(r.count)}</span>
            </button>
          ))}

          <div className="relative opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => setPicker((p) => !p)}
              className="rounded-full px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-200"
            >
              😊﹢
            </button>
            {picker && (
              <div className="absolute z-10 mt-1 flex gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-lg">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      onReact(msg._id, e);
                      setPicker(false);
                    }}
                    className="rounded-full px-1.5 py-0.5 text-base hover:bg-gray-100"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onReply(msg)}
            className="urdu rounded-full px-1.5 py-0.5 text-xs text-gray-400 opacity-0 transition hover:text-brand group-hover:opacity-100"
          >
            ↩ جواب
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const { slug } = useParams();
  const qc = useQueryClient();
  const clientId = getClientId();
  const queryKey = ['thread', slug, clientId];
  const { displayName, lang, openProfile } = useChatProfile();
  const isUrdu = lang === 'ur';

  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(0);

  const scrollRef = useRef(null);
  const atBottomRef = useRef(true);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => communityApi.thread(slug, clientId),
    refetchInterval: 30000, // socket handles realtime; this is just a safety net
  });

  // Room list for the switcher sidebar.
  const { data: rooms = [] } = useQuery({
    queryKey: ['threads'],
    queryFn: () => communityApi.threads(),
    refetchInterval: 20000,
  });

  // --- realtime socket wiring ---
  useEffect(() => {
    const socket = getSocket();
    socket.emit('room:join', slug);

    const onMessage = ({ slug: s, message }) => {
      if (s !== slug) return;
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old;
        if (old.messages.some((m) => m._id === message._id)) return old;
        return {
          ...old,
          messages: [...old.messages, message],
          thread: { ...old.thread, messageCount: (old.thread.messageCount || 0) + 1 },
        };
      });
    };
    const onReaction = ({ slug: s, messageId, reactions }) => {
      if (s !== slug) return;
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages.map((m) =>
            m._id === messageId ? { ...m, reactions: mergeReactions(m.reactions, reactions) } : m
          ),
        };
      });
    };
    const onPresence = ({ slug: s, online: n }) => {
      if (s === slug) setOnline(n);
    };

    socket.on('message:new', onMessage);
    socket.on('reaction:update', onReaction);
    socket.on('presence', onPresence);
    // re-join after a reconnect
    socket.on('connect', () => socket.emit('room:join', slug));

    return () => {
      socket.emit('room:leave');
      socket.off('message:new', onMessage);
      socket.off('reaction:update', onReaction);
      socket.off('presence', onPresence);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // --- auto-scroll to newest, unless the user scrolled up ---
  const messages = data?.messages;
  useEffect(() => {
    if (atBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const sendMut = useMutation({
    mutationFn: (payload) => communityApi.postMessage(slug, payload),
    onSuccess: (msg) => {
      setContent('');
      setReplyTo(null);
      atBottomRef.current = true;
      // Append immediately for the sender (socket echo is deduped by _id).
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old;
        if (old.messages.some((m) => m._id === msg._id)) return old;
        return {
          ...old,
          messages: [...old.messages, msg],
          thread: { ...old.thread, messageCount: (old.thread.messageCount || 0) + 1 },
        };
      });
      qc.invalidateQueries({ queryKey: ['threads'] });
      // Always jump to the newest message after sending, even if the user was
      // scrolled up. rAF waits for the new row to be laid out first.
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    onError: (err) => setError(err.message),
  });

  const reactMut = useMutation({
    mutationFn: ({ messageId, emoji }) => communityApi.react(messageId, { emoji, clientId }),
    onSuccess: (res) => {
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages.map((m) => (m._id === res._id ? { ...m, reactions: res.reactions } : m)),
        };
      });
    },
  });

  const send = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError('');
    sendMut.mutate({ content, authorName: displayName, clientId, replyToId: replyTo?._id || null });
  };

  if (isLoading) return <Loader />;
  if (isError || !data) {
    return (
      <div className="rounded-xl bg-white py-16 text-center text-gray-400 shadow-sm">
        <p className="urdu">یہ چیٹ روم موجود نہیں</p>
        <Link to="/community" className="urdu mt-2 inline-block text-brand hover:underline">
          ← واپس جائیں
        </Link>
      </div>
    );
  }

  const { thread } = data;

  return (
    <>
      <Helmet>
        <title>Narang Mandi | {thread.title} — کمیونٹی چیٹ</title>
      </Helmet>

      <div className="mb-3">
        <Link to="/community" className="urdu text-sm text-brand hover:underline">
          ← تمام چیٹ رومز
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="flex h-[75vh] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-3">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="min-w-0">
            <h1 className="urdu truncate text-lg font-bold text-ink">{thread.title}</h1>
            {thread.description && (
              <p className="urdu truncate text-xs text-gray-500">{thread.description}</p>
            )}
          </div>
          <span className="urdu flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            {toUrduNumber(online)} آن لائن
          </span>
        </div>

        {/* messages */}
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 py-2">
          {messages.length === 0 ? (
            <p className="urdu py-10 text-center text-gray-400">
              ابھی کوئی پیغام نہیں — گفتگو کا آغاز کریں! 👋
            </p>
          ) : (
            messages.map((m) => (
              <ChatRow
                key={m._id}
                msg={m}
                mine={m.clientId && m.clientId === clientId}
                onReply={setReplyTo}
                onReact={(messageId, emoji) => reactMut.mutate({ messageId, emoji })}
              />
            ))
          )}
        </div>

        {/* composer */}
        {thread.isLocked ? (
          <div className="urdu border-t border-gray-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
            🔒 یہ چیٹ روم بند ہے، نئے پیغامات نہیں بھیجے جا سکتے۔
          </div>
        ) : (
          <form onSubmit={send} className="border-t border-gray-200 bg-white p-2.5">
            {replyTo && (
              <div className="urdu mb-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                <span className="truncate">
                  <span className="font-semibold text-brand">{replyTo.authorName}</span> کو جواب: {replyTo.content}
                </span>
                <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500">
                  ✕
                </button>
              </div>
            )}
            {error && <div className="mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">{error}</div>}
            <div className="urdu mb-1.5 flex items-center gap-1.5 text-xs text-gray-500">
              <span>
                آپ: <span className="font-semibold text-ink">{displayName}</span>
              </span>
              <button
                type="button"
                onClick={openProfile}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand"
                title="نام / زبان تبدیل کریں"
                aria-label="نام / زبان تبدیل کریں"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
            <div dir={isUrdu ? 'rtl' : 'ltr'} className="flex items-center gap-2">
              <textarea
                dir={isUrdu ? 'rtl' : 'ltr'}
                rows={1}
                required
                placeholder={isUrdu ? 'پیغام لکھیں…' : 'Type a message…'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(e);
                  }
                }}
                className={` flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand ${
                  isUrdu ? 'urdu' : 'text-left'
                }`}
              />
              <button
                type="submit"
                disabled={sendMut.isPending}
                className={`flex h-11 min-w-[80px] items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold leading-none text-white hover:bg-brand-dark disabled:opacity-60 ${
                  isUrdu ? 'urdu' : ''
                }`}
              >
                {sendMut.isPending ? (
                  <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
                    />
                  </svg>
                ) : isUrdu ? (
                  'بھیجیں'
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

        {/* Rooms switcher — sits on the left in the RTL layout */}
        <aside className="order-first lg:order-none lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-3 lg:max-h-[75vh] lg:overflow-y-auto">
            <h2 className="urdu mb-2 border-b pb-2 text-sm font-bold text-ink">چیٹ رومز</h2>
            <ul className="space-y-1">
              {rooms.map((r) => {
                const active = r.slug === slug;
                return (
                  <li key={r._id}>
                    <Link
                      to={`/community/${r.slug}`}
                      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                        active ? 'bg-brand text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="urdu truncate">{r.title}</span>
                      <span
                        className={`inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-xs leading-none ${
                          active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {toUrduNumber(r.messageCount)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
