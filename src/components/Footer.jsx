import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, settingsApi } from '../api/index.js';

export default function Footer() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });
  const siteName = settings?.siteName || 'نارنگ منڈی نیوز';
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-ink text-gray-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="mb-3 text-xl font-bold text-white">{siteName}</h3>
          <p className="text-sm leading-loose text-gray-400">
            {settings?.tagline || 'آپ کے شہر کی تازہ ترین اور قابلِ اعتماد خبریں۔'}
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">زمرہ جات</h4>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {categories.slice(0, 8).map((c) => (
              <li key={c._id}>
                <Link to={`/category/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">روابط</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/about" className="hover:text-white">ہمارے بارے میں</Link></li>
            <li><Link to="/contact" className="hover:text-white">رابطہ</Link></li>
            <li><Link to="/privacy" className="hover:text-white">رازداری کی پالیسی</Link></li>
            {settings?.contactEmail && (
              <li className="text-gray-400">{settings.contactEmail}</li>
            )}
          </ul>
          {settings?.socialLinks && (
            <div className="mt-3 flex gap-3 text-sm">
              {settings.socialLinks.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-white">فیس بک</a>
              )}
              {settings.socialLinks.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" className="hover:text-white">یوٹیوب</a>
              )}
              {settings.socialLinks.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-white">ٹوئٹر</a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-400">
        © {year} {siteName} — جملہ حقوق محفوظ ہیں
      </div>
    </footer>
  );
}
