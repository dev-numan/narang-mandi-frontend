import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi, uploadApi } from '../../api/index.js';
import DataTable from '../../admin/components/DataTable.jsx';
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx';
import MultiImageUploader from '../../components/MultiImageUploader.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { formatPrice, truncateText } from '../../utils/format.js';
import { useShopLang } from '../ShopLangContext.jsx';
import { SHOP_TABLE_TYPO } from '../shopTypo.js';
import { PRODUCT_NAME_DISPLAY_MAX, PRODUCT_NAME_MAX, CATEGORY_NAME_DISPLAY_MAX } from '../../constants/products.js';
import CustomSelect from '../components/CustomSelect.jsx';

const EMPTY = { name: '', categoryId: '', description: '', price: 0, stock: 0, images: [], isActive: true };

export default function ShopProducts() {
  const { t, textClass, isUrdu, dir } = useShopLang();
  // Form fields follow UI language: English = LTR, Urdu = RTL (+ Nastaleeq).
  const fieldClass = isUrdu ? 'urdu-content' : '';
  const dataClass = isUrdu ? 'urdu-content' : 'font-nastaleeq';
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: products = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['shop-admin', 'products'],
    queryFn: () => shopAdminApi.products(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['shop-admin', 'categories'],
    queryFn: () => shopAdminApi.categories(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['shop-admin', 'products'] });
    qc.invalidateQueries({ queryKey: ['shop-admin', 'categories'] });
    qc.invalidateQueries({ queryKey: ['shop-admin', 'stats'] });
  };

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? shopAdminApi.updateProduct(id, payload) : shopAdminApi.createProduct(payload),
    onSuccess: () => {
      invalidate();
      close();
    },
    onError: (err) => setError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => shopAdminApi.removeProduct(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (p) => {
    setError('');
    if (p) {
      setForm({
        name: p.name,
        categoryId: p.category?._id || '',
        description: p.description || '',
        price: p.price || 0,
        stock: p.stock || 0,
        images: p.images || [],
        isActive: p.isActive,
      });
      setModal({ id: p._id });
    } else {
      setForm(EMPTY);
      setModal({ id: null });
    }
  };
  const close = () => setModal(null);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const name = String(form.name || '').trim();
    if (name.length > PRODUCT_NAME_MAX) {
      setError(t('productNameTooLong'));
      return;
    }
    saveMut.mutate({
      id: modal.id,
      payload: {
        ...form,
        name,
        categoryId: form.categoryId || null,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      },
    });
  };

  const columns = [
    {
      key: 'name',
      header: t('colProduct'),
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-gray-100">
            {r.images?.[0] ? (
              <img src={r.images[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-gray-300">📦</span>
            )}
          </div>
          <span className="urdu-content min-w-0 font-medium" title={r.name} dir="auto">
            {truncateText(r.name, PRODUCT_NAME_DISPLAY_MAX)}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('colCategory'),
      render: (r) => (
        <span className="urdu-content" title={r.category?.name || ''} dir="auto">
          {r.category?.name ? truncateText(r.category.name, CATEGORY_NAME_DISPLAY_MAX) : '—'}
        </span>
      ),
    },
    { key: 'price', header: t('colPrice'), render: (r) => formatPrice(r.price) },
    {
      key: 'stock',
      header: t('colStock'),
      render: (r) => <span className={r.stock <= 3 ? 'font-semibold text-orange-600' : ''}>{r.stock}</span>,
    },
    {
      key: 'isActive',
      header: t('colActive'),
      render: (r) =>
        r.isActive ? (
          <span className="typo-shop-meta rounded-full bg-green-100 px-2 py-0.5 text-green-700">Yes</span>
        ) : (
          <span className="typo-shop-meta rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">No</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => open(r)} className="typo-shop-button-sm rounded-lg border border-gray-300 px-3.5 py-2 hover:bg-gray-50">
            {t('edit')}
          </button>
          <button onClick={() => setToDelete(r)} className="typo-shop-button-sm rounded-lg border border-red-300 px-3.5 py-2 text-red-600 hover:bg-red-50">
            {t('delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${textClass} typo-shop-page-title font-bold text-ink`}>{t('productsTitle')}</h1>
        <button onClick={() => open(null)} className={`${textClass} typo-shop-button rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark`}>
          {t('addProduct')}
        </button>
      </div>

      {actionError && <div className={`${textClass} typo-shop-alert mb-4 rounded-lg bg-red-50 px-4 py-2 text-red-700`}>{actionError}</div>}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={products}
          empty={t('emptyProducts')}
          pageSize={10}
          typo={SHOP_TABLE_TYPO}
          labels={{
            prev: t('pagePrev'),
            next: t('pageNext'),
            showing: (from, to, total) => t('pageShowing', from, to, total),
          }}
        />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={submit}
            dir={dir}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className={`${textClass} typo-shop-modal-title mb-4 font-bold text-ink`}>{modal.id ? t('editProduct') : t('newProduct')}</h3>
            {error && <div className={`${textClass} typo-shop-alert mb-3 rounded-lg bg-red-50 px-3 py-2 text-red-700`}>{error}</div>}
            <div className="space-y-3">
              <input
                dir={dir}
                required
                maxLength={PRODUCT_NAME_MAX}
                placeholder={t('productNamePlaceholder')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`${fieldClass} typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand`}
              />
              <p className={`typo-shop-meta text-gray-400 ${isUrdu ? 'text-right' : 'text-left'}`} dir="ltr">
                {String(form.name || '').length}/{PRODUCT_NAME_MAX}
              </p>
              <CustomSelect
                value={form.categoryId}
                onChange={(categoryId) => setForm({ ...form, categoryId })}
                placeholder={t('selectCategory')}
                dir={dir}
                buttonClassName={`typo-shop-input ${textClass}`}
                optionClassName="typo-shop-input"
                labelClassName={form.categoryId ? dataClass : textClass}
                options={[
                  { value: '', label: t('selectCategory') },
                  ...categories.map((c) => ({ value: c._id, label: c.name })),
                ]}
              />
              <div className="flex gap-3">
                <label className={`${textClass} typo-shop-label flex-1 text-gray-600`}>
                  {t('priceRs')}
                  <input
                    type="number"
                    min="0"
                    dir="ltr"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="typo-shop-input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
                  />
                </label>
                <label className={`${textClass} typo-shop-label flex-1 text-gray-600`}>
                  {t('stockQty')}
                  <input
                    type="number"
                    min="0"
                    dir="ltr"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="typo-shop-input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
                  />
                </label>
              </div>
              <textarea
                dir={dir}
                rows={3}
                placeholder={t('descriptionOptional')}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${fieldClass} typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand`}
              />
              <MultiImageUploader
                value={form.images}
                onChange={(images) => setForm({ ...form, images })}
                uploadFn={uploadApi.image}
                max={5}
                label={t('images')}
                labelClassName={textClass}
                addLabel={isUrdu ? 'تصویر' : 'Image'}
                dir={dir}
              />
              <label className={`${textClass} typo-shop-label flex items-center gap-2`}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-brand"
                />
                {t('showOnShop')}
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={close} className={`${textClass} typo-shop-button rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50`}>
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saveMut.isPending}
                className={`${textClass} typo-shop-button rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60`}
              >
                {saveMut.isPending ? t('saving') : t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t('deleteProductTitle')}
        message={toDelete ? t('deleteProductMsg', toDelete.name) : ''}
        confirmLabel={t('confirmDelete')}
        cancelLabel={t('cancel')}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
