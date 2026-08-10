import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driverApi } from '../../api/index.js';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const field = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-brand';

export default function DriverProfile() {
  const qc = useQueryClient();
  const { data: me, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['driver', 'me'],
    queryFn: driverApi.me,
  });
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    if (me) {
      setForm({
        phone: me.phone || '',
        whatsapp: me.whatsapp || '',
        vehicleType: me.vehicleType || '',
        vehicleNumber: me.vehicleNumber || '',
      });
    }
  }, [me]);

  const save = useMutation({
    mutationFn: () => driverApi.updateMe(form),
    onSuccess: () => {
      setSaved('محفوظ ہو گیا');
      setTimeout(() => setSaved(''), 2000);
      qc.invalidateQueries({ queryKey: ['driver', 'me'] });
    },
  });

  if (isLoading || !form) return <Loader />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="p-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-1 font-bold text-ink">{me.name}</p>
        <p className="mb-4 text-sm text-gray-500">{me.email}</p>

        <div className="grid gap-3">
          <label className="urdu block text-sm text-gray-600">
            فون نمبر
            <input dir="ltr" className={`${field} mt-1`} value={form.phone} onChange={set('phone')} />
          </label>
          <label className="urdu block text-sm text-gray-600">
            واٹس ایپ
            <input dir="ltr" className={`${field} mt-1`} value={form.whatsapp} onChange={set('whatsapp')} />
          </label>
          <label className="urdu block text-sm text-gray-600">
            گاڑی کی قسم
            <input
              className={`${field} urdu mt-1`}
              placeholder="رکشہ / کار / بائیک"
              value={form.vehicleType}
              onChange={set('vehicleType')}
            />
          </label>
          <label className="urdu block text-sm text-gray-600">
            گاڑی نمبر
            <input dir="ltr" className={`${field} mt-1`} value={form.vehicleNumber} onChange={set('vehicleNumber')} />
          </label>
        </div>

        {saved && <p className="urdu mt-3 text-sm text-green-600">{saved}</p>}

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="urdu mt-4 w-full rounded-lg bg-brand py-2.5 font-semibold text-white disabled:opacity-50"
        >
          محفوظ کریں
        </button>

        <p className="urdu mt-4 text-xs text-gray-500">
          مکمل سفر: {me.completedRides ?? 0}
        </p>
      </div>
    </div>
  );
}
