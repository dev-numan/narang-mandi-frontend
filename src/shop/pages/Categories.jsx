import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import DataTable from '../../admin/components/DataTable.jsx';
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { useShopLang } from '../ShopLangContext.jsx';
import { SHOP_TABLE_TYPO } from '../shopTypo.js';
import { CATEGORY_NAME_MAX, CATEGORY_NAME_DISPLAY_MAX } from '../../constants/products.js';
import { truncateText } from '../../utils/format.js';

const EMPTY = { name: '', order: 0, isActive: true };

export default function ShopCategories() {
  const { t, textClass, isUrdu, dir } = useShopLang();
  const fieldClass = isUrdu ? 'urdu-content' : '';
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: categories = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['shop-admin', 'categories'],
    queryFn: () => shopAdminApi.categories(),
  });

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? shopAdminApi.updateCategory(id, payload) : shopAdminApi.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-admin', 'categories'] });
      close();
    },
    onError: (err) => setError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => shopAdminApi.removeCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-admin', 'categories'] });
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (c) => {
    setError('');
    if (c) {
      setForm({ name: c.name, order: c.order || 0, isActive: c.isActive });
      setModal({ id: c._id });
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
    if (name.length > CATEGORY_NAME_MAX) {
      setError(t('categoryNameTooLong'));
      return;
    }
    saveMut.mutate({
      id: modal.id,
      payload: { ...form, name, nameEn: '', order: Number(form.order) || 0 },
    });
  };

  const columns = [
    {
      key: 'name',
      header: t('colName'),
      render: (r) => (
        <span className="urdu-content font-medium" title={r.name} dir="auto">
          {truncateText(r.name, CATEGORY_NAME_DISPLAY_MAX)}
        </span>
      ),
    },
    { key: 'productCount', header: t('colProducts'), render: (r) => r.productCount ?? 0 },
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
        <h1 className={`${textClass} typo-shop-page-title font-bold text-ink`}>{t('categoriesTitle')}</h1>
        <button onClick={() => open(null)} className={`${textClass} typo-shop-button rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark`}>
          {t('addCategory')}
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
          rows={categories}
          empty={t('emptyCategories')}
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
          <form onSubmit={submit} dir={dir} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className={`${textClass} typo-shop-modal-title mb-4 font-bold text-ink`}>{modal.id ? t('editCategory') : t('newCategory')}</h3>
            {error && <div className={`${textClass} typo-shop-alert mb-3 rounded-lg bg-red-50 px-3 py-2 text-red-700`}>{error}</div>}
            <div className="space-y-3">
              <input
                dir={dir}
                required
                maxLength={CATEGORY_NAME_MAX}
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`${fieldClass} typo-shop-input w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand`}
              />
              <p className={`typo-shop-meta text-gray-400 ${isUrdu ? 'text-right' : 'text-left'}`} dir="ltr">
                {String(form.name || '').length}/{CATEGORY_NAME_MAX}
              </p>
              <div className="flex items-center gap-4">
                <label className={`${textClass} typo-shop-label`}>
                  {t('order')}:
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="typo-shop-input ml-2 w-20 rounded-lg border border-gray-300 px-2 py-1"
                  />
                </label>
                <label className={`${textClass} typo-shop-label flex items-center gap-2`}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 accent-brand"
                  />
                  {t('active')}
                </label>
              </div>
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
        title={t('deleteCategoryTitle')}
        message={toDelete ? t('deleteCategoryMsg', toDelete.name) : ''}
        confirmLabel={t('confirmDelete')}
        cancelLabel={t('cancel')}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
