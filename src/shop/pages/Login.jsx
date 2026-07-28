import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ShopLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role === 'shopkeeper') {
    navigate('/shop/admin', { replace: true });
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u?.role === 'shopkeeper') {
        navigate('/shop/admin', { replace: true });
      } else {
        setError('This account is not a shopkeeper account.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root flex min-h-screen items-center justify-center bg-gray-100 p-4" dir="ltr">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="Narang Mandi" className="mx-auto mb-3 h-14 w-14 rounded-xl object-cover" />
          <h1 className="typo-shop-login-title font-bold text-ink">Shopkeeper Panel</h1>
          <p className="typo-shop-login-subtitle text-gray-500">Manage your shop</p>
        </div>

        {error && <div className="typo-shop-login-error mb-4 rounded-lg bg-red-50 px-4 py-2 text-red-700">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="typo-shop-login-label mb-1 block text-left font-medium text-gray-700">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="typo-shop-login-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" placeholder="shop@narangmandi.com" />
          </div>
          <div>
            <label className="typo-shop-login-label mb-1 block text-left font-medium text-gray-700">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="typo-shop-login-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="typo-shop-login-button w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
