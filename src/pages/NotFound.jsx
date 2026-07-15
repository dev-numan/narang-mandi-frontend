import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { SITE_NAME } from '../constants/brand.js';

export default function NotFound() {
  return (
    <>
      {/* noindex so this "page not found" title can never be indexed for a real URL */}
      <Seo title={`${SITE_NAME} | صفحہ نہیں ملا`} noindex />
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-7xl font-bold text-brand">۴۰۴</h1>
        <p className="mt-4 text-2xl font-semibold text-ink">صفحہ نہیں ملا</p>
        <p className="mt-2 text-gray-500">
          معذرت، آپ جس صفحے کو تلاش کر رہے ہیں وہ موجود نہیں ہے۔
        </p>
        <Link
          to="/"
          className="mt-6 rounded-lg bg-brand px-6 py-2 text-white hover:bg-brand-dark"
        >
          صفحۂ اول پر واپس جائیں
        </Link>
      </div>
    </>
  );
}
