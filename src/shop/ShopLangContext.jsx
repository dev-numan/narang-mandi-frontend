import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { STRINGS } from './i18n.js';

const ShopLangContext = createContext(null);

function normalizeLang(value) {
  return value === 'ur' ? 'ur' : 'en';
}

export function ShopLangProvider({ children }) {
  const { user, reload } = useAuth();
  const [lang, setLangState] = useState(() => normalizeLang(user?.shopAdminLang));
  const [saving, setSaving] = useState(false);

  // Sync from DB whenever the logged-in user loads / changes. Default is English.
  useEffect(() => {
    if (!user) {
      setLangState('en');
      return;
    }
    setLangState(normalizeLang(user.shopAdminLang));
  }, [user?.id, user?.shopAdminLang]);

  const setLang = useCallback(
    async (next) => {
      const value = normalizeLang(next);
      setLangState(value);
      if (!user) return;
      if (normalizeLang(user.shopAdminLang) === value) return;
      setSaving(true);
      try {
        await authApi.updateMe({ shopAdminLang: value });
        await reload();
      } catch {
        // Revert UI if save failed
        setLangState(normalizeLang(user.shopAdminLang));
      } finally {
        setSaving(false);
      }
    },
    [user, reload],
  );

  const t = useCallback(
    (key, ...args) => {
      const dict = STRINGS[lang] || STRINGS.en;
      const val = dict[key] ?? STRINGS.en[key] ?? key;
      return typeof val === 'function' ? val(...args) : val;
    },
    [lang],
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      saving,
      isUrdu: lang === 'ur',
      dir: lang === 'ur' ? 'rtl' : 'ltr',
      textClass: lang === 'ur' ? 'urdu' : '',
    }),
    [lang, setLang, t, saving],
  );

  return <ShopLangContext.Provider value={value}>{children}</ShopLangContext.Provider>;
}

export function useShopLang() {
  const ctx = useContext(ShopLangContext);
  if (!ctx) throw new Error('useShopLang must be used within ShopLangProvider');
  return ctx;
}
