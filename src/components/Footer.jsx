import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, settingsApi } from '../api/index.js';
import { HUB_HEADLINE, SITE_NAME } from '../constants/brand.js';
import { CONTACT_WHATSAPP_DISPLAY, CONTACT_WHATSAPP_URL } from '../constants/contact.js';
import { mergeSocialLinks } from '../constants/social.js';

const SOCIAL_ITEMS = [
  ['facebook', 'Facebook', 'فیس بک'],
  ['youtube', 'YouTube', 'یوٹیوب'],
  ['whatsapp', 'WhatsApp', 'واٹس ایپ'],
  ['twitter', 'Twitter', 'ٹوئٹر'],
];

export default function Footer() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });
  const socialLinks = mergeSocialLinks(settings?.socialLinks);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-ink text-gray-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="mb-3 text-xl font-bold text-white">{SITE_NAME}</h3>
          <p className="text-sm leading-loose text-gray-400">
            {settings?.tagline || `${SITE_NAME} — ${HUB_HEADLINE}.`}
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
            <li>
              <Link to="/contact" className="hover:text-white">رابطہ</Link>
            </li>
            <li>
              <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-white" dir="ltr">
                واٹس ایپ: {CONTACT_WHATSAPP_DISPLAY}
              </a>
            </li>
            <li><Link to="/privacy" className="hover:text-white">رازداری کی پالیسی</Link></li>
            <li><Link to="/terms" className="hover:text-white">شرائط و ضوابط</Link></li>
            {settings?.contactEmail && (
              <li className="text-gray-400">{settings.contactEmail}</li>
            )}
          </ul>
          <h4 className="mb-2 mt-4 font-bold text-white">سوشل میڈیا</h4>
          <ul className="space-y-1 text-sm">
            {SOCIAL_ITEMS.filter(([key]) => socialLinks[key]).map(([key, en, ur]) => (
              <li key={key}>
                <a
                  href={socialLinks[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {en} <span className="urdu text-gray-400">({ur})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-400">
        © {year} {SITE_NAME} — جملہ حقوق محفوظ ہیں
      </div>
    </footer>
  );
}
