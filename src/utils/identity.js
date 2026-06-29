// Lightweight anonymous identity for the open community board (no accounts).
// - clientId: a stable random id per browser, used to dedupe reactions and
//   recognise a visitor's own messages.
// - displayName: the name a visitor chooses to post under (defaults to گمنام).

const CLIENT_KEY = 'nm_client_id';
const NAME_KEY = 'nm_display_name';
const LANG_KEY = 'nm_chat_lang'; // 'en' | 'ur'
const ONBOARDED_KEY = 'nm_chat_onboarded';

export function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export function getDisplayName() {
  return localStorage.getItem(NAME_KEY) || '';
}

export function setDisplayName(name) {
  localStorage.setItem(NAME_KEY, (name || '').trim());
}

// Preferred typing language for the chat composer. Defaults to English.
export function getPreferredLang() {
  return localStorage.getItem(LANG_KEY) || 'en';
}

export function setPreferredLang(lang) {
  localStorage.setItem(LANG_KEY, lang === 'ur' ? 'ur' : 'en');
}

// Whether the visitor has completed the first-time chat profile setup.
export function isChatOnboarded() {
  return !!localStorage.getItem(ONBOARDED_KEY);
}

export function markChatOnboarded() {
  localStorage.setItem(ONBOARDED_KEY, '1');
}
