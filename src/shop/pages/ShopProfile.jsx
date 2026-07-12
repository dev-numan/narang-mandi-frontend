import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import ImageUploader from '../../admin/components/ImageUploader.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const EMPTY = { name: '', description: '', logo: '', coverImage: '', phone: '', whatsapp: '', address: '' };

export default function ShopProfile() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: shop, isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['shop-admin', 'shop'],
    queryFn: () => shopAdminApi.shop(),
  });

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '',
        description: shop.description || '',
        logo: shop.logo || '',
        coverImage: shop.coverImage || '',
        phone: shop.phone || '',
        whatsapp: shop.whatsapp || '',
        address: shop.address || '',
      });
    }
  }, [shop]);

  const saveMut = useMutation({
    mutationFn: (payload) => shopAdminApi.updateShop(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-admin', 'shop'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => setError(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    saveMut.mutate(form);
  };

  if (isLoading) return <Loader label="Loading…" />;
  if (isError) return <ErrorState error={queryError} onRetry={refetch} />;

  return (
    <div className="max-w-2xl">
      <h1 className="urdu mb-6 text-2xl font-bold text-ink">دکان کی پروفائل</h1>

      {error && <div className="urdu mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {saved && <div className="urdu mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">تبدیلیاں محفوظ ہو گئیں</div>}

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="urdu mb-1 block text-sm font-medium text-gray-700">دکان کا نام</label>
          <input dir="rtl" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
        </div>
        <div>
          <label className="urdu mb-1 block text-sm font-medium text-gray-700">تفصیل</label>
          <textarea dir="rtl" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="urdu flex-1 text-sm text-gray-700">
            فون
            <input dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <label className="urdu flex-1 text-sm text-gray-700">
            واٹس ایپ
            <input dir="ltr" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
        </div>
        <div>
          <label className="urdu mb-1 block text-sm font-medium text-gray-700">پتہ</label>
          <input dir="rtl" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
        </div>
        <ImageUploader value={form.logo} onChange={(logo) => setForm({ ...form, logo })} label="لوگو" />
        <ImageUploader value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} label="کور تصویر" />

        <div className="flex justify-end">
          <button type="submit" disabled={saveMut.isPending} className="urdu rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {saveMut.isPending ? 'محفوظ…' : 'محفوظ کریں'}
          </button>
        </div>
      </form>
    </div>
  );
}
