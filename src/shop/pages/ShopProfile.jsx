import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, shopAdminApi } from '../../api/index.js';
import ImageUploader from '../../admin/components/ImageUploader.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { useShopLang } from '../ShopLangContext.jsx';

const EMPTY = { name: '', description: '', logo: '', coverImage: '', phone: '', whatsapp: '', address: '' };
const EMPTY_PW = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ShopProfile() {
  const { t, textClass, lang, setLang, saving: langSaving, dir } = useShopLang();
  // Shop name / description / address are Urdu data — always Nastaleeq + roomy padding.
  const urduFieldClass = 'urdu-content';
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState(EMPTY_PW);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

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

  const pwMut = useMutation({
    mutationFn: (payload) => authApi.changePassword(payload),
    onSuccess: () => {
      setPwForm(EMPTY_PW);
      setPwError('');
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    },
    onError: (err) => setPwError(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    saveMut.mutate(form);
  };

  const submitPassword = (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword.length < 6) {
      setPwError(t('pwMinLength'));
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError(t('pwMismatch'));
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwError(t('pwSameAsOld'));
      return;
    }
    pwMut.mutate(pwForm);
  };

  if (isLoading) return <Loader label="Loading…" />;
  if (isError) return <ErrorState error={queryError} onRetry={refetch} />;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className={`${textClass} typo-shop-page-title mb-6 font-bold text-ink`}>{t('profileTitle')}</h1>

        {/* Language setting */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className={`${textClass} typo-shop-section-title mb-1 font-bold text-ink`}>{t('language')}</h2>
          <p className={`${textClass} typo-shop-hint mb-4 text-gray-500`}>{t('languageHint')}</p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={langSaving}
              onClick={() => setLang('en')}
              className={`typo-shop-button rounded-lg px-4 py-2 font-semibold transition disabled:opacity-60 ${
                lang === 'en' ? 'bg-brand text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('langEnglish')}
            </button>
            <button
              type="button"
              disabled={langSaving}
              onClick={() => setLang('ur')}
              className={`urdu typo-shop-button rounded-lg px-4 py-2 font-semibold transition disabled:opacity-60 ${
                lang === 'ur' ? 'bg-brand text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('langUrdu')}
            </button>
          </div>
        </div>

        {error && <div className={`${textClass} typo-shop-alert mb-4 rounded-lg bg-red-50 px-4 py-2 text-red-700`}>{error}</div>}
        {saved && <div className={`${textClass} typo-shop-alert mb-4 rounded-lg bg-green-50 px-4 py-2 text-green-700`}>{t('saved')}</div>}

        <form onSubmit={submit} dir={dir} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div>
            <label className={`${textClass} typo-shop-label mb-1 block font-medium text-gray-700`}>{t('shopName')}</label>
            <input
              dir="rtl"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`${urduFieldClass} typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand`}
            />
          </div>
          <div>
            <label className={`${textClass} typo-shop-label mb-1 block font-medium text-gray-700`}>{t('description')}</label>
            <textarea
              dir="rtl"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${urduFieldClass} typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand`}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className={`${textClass} typo-shop-label flex-1 text-gray-700`}>
              {t('phone')}
              <input
                dir="ltr"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="typo-shop-input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
            </label>
            <label className={`${textClass} typo-shop-label flex-1 text-gray-700`}>
              {t('whatsapp')}
              <input
                dir="ltr"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="typo-shop-input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
            </label>
          </div>
          <div>
            <label className={`${textClass} typo-shop-label mb-1 block font-medium text-gray-700`}>{t('address')}</label>
            <input
              dir="rtl"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={`${urduFieldClass} typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand`}
            />
          </div>
          <ImageUploader value={form.logo} onChange={(logo) => setForm({ ...form, logo })} label={t('logo')} />
          <ImageUploader value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} label={t('coverImage')} />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveMut.isPending}
              className={`${textClass} typo-shop-button rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60`}
            >
              {saveMut.isPending ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className={`${textClass} typo-shop-section-title mb-4 font-bold text-ink`}>{t('changePassword')}</h2>

        {pwError && <div className={`${textClass} typo-shop-alert mb-4 rounded-lg bg-red-50 px-4 py-2 text-red-700`}>{pwError}</div>}
        {pwSaved && (
          <div className={`${textClass} typo-shop-alert mb-4 rounded-lg bg-green-50 px-4 py-2 text-green-700`}>{t('passwordChanged')}</div>
        )}

        <form onSubmit={submitPassword} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" autoComplete="off">
          <div>
            <label className={`${textClass} typo-shop-label mb-1 block font-medium text-gray-700`}>{t('currentPassword')}</label>
            <input
              type="password"
              required
              dir="ltr"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className={`${textClass} typo-shop-label mb-1 block font-medium text-gray-700`}>{t('newPassword')}</label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              autoComplete="new-password"
              placeholder={t('passwordMinPlaceholder')}
            />
          </div>
          <div>
            <label className={`${textClass} typo-shop-label mb-1 block font-medium text-gray-700`}>{t('confirmPassword')}</label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className="typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwMut.isPending}
              className={`${textClass} typo-shop-button rounded-lg bg-ink px-5 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-60`}
            >
              {pwMut.isPending ? t('changingPassword') : t('changePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
