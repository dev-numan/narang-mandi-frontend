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
        setError('یہ اکاؤنٹ دکاندار کا نہیں ہے۔');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-2xl font-bold text-white">
            🏪
          </span>
          <h1 className="urdu text-xl font-bold text-ink">دکاندار پینل</h1>
          <p className="urdu text-sm text-gray-500">اپنی دکان کا انتظام کریں</p>
        </div>

        {error && <div className="urdu mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="urdu mb-1 block text-sm font-medium text-gray-700">ای میل</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" placeholder="shop@narangmandi.com" />
          </div>
          <div>
            <label className="urdu mb-1 block text-sm font-medium text-gray-700">پاس ورڈ</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="urdu w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {loading ? 'لاگ اِن ہو رہا ہے…' : 'لاگ اِن'}
          </button>
        </form>
      </div>
    </div>
  );
}
