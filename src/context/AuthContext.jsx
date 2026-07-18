import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/index.js';

const AuthContext = createContext(null);

// While an admin is "logged in as" another user, their own token is stashed
// here so they can return to their admin session without re-entering a password.
const BACKUP_KEY = 'adminBackupToken';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(
    () => !!localStorage.getItem(BACKUP_KEY),
  );

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = async (email, password) => {
    const { user: u, accessToken } = await authApi.login({ email, password });
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem(BACKUP_KEY);
    setImpersonating(false);
    setUser(null);
  };

  // Enter another user's session (admin "log in as"). Stashes the admin's own
  // token first so returnToAdmin() can restore it. Does not overwrite an
  // existing backup, so nested impersonation still returns to the real admin.
  const impersonate = (accessToken, targetUser) => {
    const own = localStorage.getItem('accessToken');
    if (own && !localStorage.getItem(BACKUP_KEY)) {
      localStorage.setItem(BACKUP_KEY, own);
    }
    localStorage.setItem('accessToken', accessToken);
    setImpersonating(true);
    setUser(targetUser);
  };

  // Restore the stashed admin token and reload the admin's own profile.
  const returnToAdmin = async () => {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return;
    localStorage.setItem('accessToken', backup);
    localStorage.removeItem(BACKUP_KEY);
    setImpersonating(false);
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, impersonating, login, logout, impersonate, returnToAdmin, reload: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
