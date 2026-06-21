import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sanitizeHtml } from '../../utils/sanitize.js';
import { adminApi, articlesApi, categoriesApi } from '../../api/index.js';
import RichTextEditor from '../components/RichTextEditor.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import Loader from '../../components/Loader.jsx';
// Latin/Urdu friendly slug for the editable slug field.
function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '');
}

// Extract the src of the first <img> in the rich-text HTML (if any).
function firstImageFromHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelector('img')?.getAttribute('src') || '';
}

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  tags: [],
  isCarousel: false,
  status: 'draft',
};

export default function ArticleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState(EMPTY);
  const [tagsInput, setTagsInput] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  // When false, the cover image mirrors the first image in the content.
  // Becomes true once the user uploads/picks a cover manually.
  const [coverManual, setCoverManual] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.list(true),
  });

  const { data: existing, isLoading: loadingArticle } = useQuery({
    queryKey: ['admin', 'article', id],
    queryFn: () => adminApi.article(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        slug: existing.slug || '',
        excerpt: existing.excerpt || '',
        content: existing.content || '',
        coverImage: existing.coverImage || '',
        category: existing.category?._id || existing.category || '',
        tags: existing.tags || [],
        isCarousel: !!existing.isCarousel,
        status: existing.status || 'draft',
      });
      setTagsInput((existing.tags || []).join(', '));
      setSlugTouched(true);
      // A saved cover counts as a manual choice; otherwise let it follow content.
      setCoverManual(!!existing.coverImage);
    }
  }, [existing]);

  // Auto-use the first image found in the content as the cover, until the user
  // overrides it manually with the uploader below.
  useEffect(() => {
    if (coverManual) return;
    const img = firstImageFromHtml(form.content);
    if (img && img !== form.coverImage) {
      setForm((f) => ({ ...f, coverImage: img }));
    }
  }, [form.content, coverManual, form.coverImage]);

  // Auto-generate slug from title until the user edits it manually.
  useEffect(() => {
    if (!slugTouched && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugTouched]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const saveMut = useMutation({
    mutationFn: ({ payload }) =>
      isEdit ? articlesApi.update(id, payload) : articlesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      navigate('/admin/articles');
    },
    onError: (err) => setError(err.message),
  });

  const submit = (status) => {
    setError('');
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      ...form,
      tags,
      category: form.category || null,
      status,
    };
    saveMut.mutate({ payload });
  };

  const safePreview = useMemo(() => sanitizeHtml(form.content || ''), [form.content]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">
          {isEdit ? 'Edit Article' : 'New Article'}
        </h1>
        <button
          onClick={() => navigate('/admin/articles')}
          className="text-sm text-gray-500 hover:text-ink"
        >
          ← Back to list
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {isEdit && loadingArticle ? (
        <Loader label="Loading…" />
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <Field label="Title (Urdu)">
            <input
              dir="rtl"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-lg outline-none focus:border-brand"
              placeholder="خبر کی سرخی…"
            />
          </Field>

          <Field label="Slug (URL) — auto-generated">
            <input
              value={form.slug}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 outline-none"
              placeholder="auto-generated-from-title"
            />
          </Field>

          <Field label="Excerpt (short summary)">
            <textarea
              dir="rtl"
              rows={3}
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              placeholder="مختصر تفصیل…"
            />
          </Field>

          <Field label="Content (rich text, Urdu)">
            <RichTextEditor value={form.content} onChange={(html) => set('content', html)} />
          </Field>

          {showPreview && form.content && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Live RTL preview</span>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  hide
                </button>
              </div>
              <div
                className="article-content urdu max-w-full overflow-hidden break-words rounded-lg border border-gray-200 bg-white p-5"
                dangerouslySetInnerHTML={{ __html: safePreview }}
              />
            </div>
          )}
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-ink">Publish</h3>
            <p className="text-sm text-gray-500">
              Current status:{' '}
              <span className="font-medium capitalize">{form.status}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => submit('draft')}
                disabled={saveMut.isPending}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
              >
                Save Draft
              </button>
              <button
                onClick={() => submit('published')}
                disabled={saveMut.isPending}
                className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {saveMut.isPending ? 'Saving…' : 'Publish'}
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tags (comma separated)">
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder="کھیل, کرکٹ"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <ImageUploader
              value={form.coverImage}
              hint={
                coverManual
                  ? 'Custom cover selected. Remove to revert to the first image in the content.'
                  : 'Auto-set from the first image in the content. Choose a file to override.'
              }
              onChange={(url) => {
                // Picking a file = manual override; removing = fall back to content image.
                setCoverManual(!!url);
                set('coverImage', url);
              }}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
