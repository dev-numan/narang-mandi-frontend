import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  getDisplayName,
  setDisplayName,
  getPreferredLang,
  setPreferredLang,
  isChatOnboarded,
  markChatOnboarded,
} from '../utils/identity.js';

const ChatProfileContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useChatProfile = () => useContext(ChatProfileContext);

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو (Urdu)' },
];

function ChatProfileModal({ initial, firstTime, onSave, onClose }) {
  const [name, setName] = useState(initial.name);
  const [lang, setLang] = useState(initial.lang);

  const submit = (e) => {
    e.preventDefault();
    onSave({ name, lang });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="urdu mb-1 text-lg font-bold text-ink">
          {firstTime ? 'چیٹ میں خوش آمدید 👋' : 'پروفائل میں تبدیلی'}
        </h3>
        <p className="urdu mb-4 text-xs text-gray-500">
          {firstTime
            ? 'گفتگو شروع کرنے سے پہلے اپنا نام اور ٹائپنگ کی زبان منتخب کریں'
            : 'اپنا نام یا ٹائپنگ کی زبان تبدیل کریں'}
        </p>

        <label className="urdu mb-1 block text-sm font-medium text-gray-700">آپ کا نام</label>
        <input
          dir={lang === 'ur' ? 'rtl' : 'ltr'}
          autoFocus
          placeholder={lang === 'ur' ? 'مثلاً احمد' : 'e.g. Ahmed'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="urdu mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
        />

        <label className="urdu mb-1 block text-sm font-medium text-gray-700">ٹائپنگ کی زبان</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
        >
          {LANGS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <div className="mt-6 flex justify-end gap-3">
          {!firstTime && (
            <button
              type="button"
              onClick={onClose}
              className="urdu rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              منسوخ
            </button>
          )}
          <button
            type="submit"
            className="urdu rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {firstTime ? 'چیٹ شروع کریں' : 'محفوظ کریں'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CommunityLayout() {
  const [profile, setProfileState] = useState({
    name: getDisplayName(),
    lang: getPreferredLang(),
  });
  const [onboarded, setOnboarded] = useState(isChatOnboarded());
  const [open, setOpen] = useState(!isChatOnboarded());

  const save = ({ name, lang }) => {
    const clean = (name || '').trim();
    setDisplayName(clean);
    setPreferredLang(lang);
    markChatOnboarded();
    setProfileState({ name: clean, lang });
    setOnboarded(true);
    setOpen(false);
  };

  return (
    <ChatProfileContext.Provider
      value={{
        name: profile.name,
        lang: profile.lang,
        displayName: profile.name || 'گمنام',
        openProfile: () => setOpen(true),
      }}
    >
      <Outlet />
      {open && (
        <ChatProfileModal
          initial={profile}
          firstTime={!onboarded}
          onSave={save}
          onClose={() => setOpen(false)}
        />
      )}
    </ChatProfileContext.Provider>
  );
}
