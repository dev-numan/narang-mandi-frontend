import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/index.js';

export default function About() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const siteName = settings?.siteName || 'نارنگ منڈی نیوز';

  return (
    <>
      <Helmet>
        <title>ہمارے بارے میں — {siteName}</title>
      </Helmet>
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-4 border-b-2 border-brand pb-2 text-2xl font-bold text-ink sm:text-3xl">
          ہمارے بارے میں
        </h1>
        <div className="article-content">
          <p>
            {siteName} نارنگ منڈی شہر کی ایک معتبر خبر رساں ویب سائٹ ہے جو اپنے قارئین تک
            تازہ ترین، مستند اور غیر جانبدار خبریں پہنچانے کے لیے کوشاں ہے۔
          </p>
          <p>
            ہم سیاست، کھیل، کاروبار، تعلیم، صحت اور مقامی واقعات سمیت ہر موضوع پر
            خبریں فراہم کرتے ہیں تاکہ ہمارے قارئین باخبر رہ سکیں۔
          </p>
          <p>
            ہمارا مقصد سچی اور بروقت اطلاعات کے ذریعے معاشرے میں مثبت کردار ادا کرنا ہے۔
          </p>
        </div>
      </div>
    </>
  );
}
