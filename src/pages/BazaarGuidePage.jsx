import Seo from '../components/Seo.jsx';

/**
 * How to order from Narang Bazaar, in Urdu, for customers.
 *
 * Public and unauthenticated: ordering itself needs no account, so a guide that
 * sat behind a login would contradict the thing it documents.
 *
 * Labels are copied verbatim from the Android app, which is where the
 * screenshots come from. The web site duplicates these strings rather than
 * sharing them and words several of them differently — quoting the web wording
 * here would stop matching the pictures.
 */

const APP_URL = 'https://play.google.com/store/apps/details?id=com.narangmandi';

const STEPS = [
  {
    n: 1,
    title: 'بازار کھولیں',
    body: 'ایپ کھول کر نیچے کی پٹی میں «بازار» پر کلک کریں۔ نارنگ منڈی کی تمام دکانیں یہاں نظر آئیں گی۔ اوپر والے خانے سے دکان کا نام لکھ کر تلاش بھی کر سکتے ہیں۔',
    shot: 'bazaar/01-shops.png',
    caption: 'مقامی دکانیں',
  },
  {
    n: 2,
    title: 'دکان کھولیں',
    body: 'جس دکان سے خریداری کرنی ہو، اس پر کلک کریں۔ اندر اس دکان کی تمام مصنوعات تصویر اور قیمت کے ساتھ نظر آئیں گی۔',
    shot: 'bazaar/02-shop.png',
    caption: 'دکان کی مصنوعات',
  },
  {
    n: 3,
    title: 'مصنوعہ منتخب کریں',
    body: 'کسی چیز پر کلک کریں تو اس کی پوری تفصیل کھل جائے گی۔ «تعداد» کے سامنے − اور + سے کتنی چاہئیں وہ طے کریں، پھر نیلا «خریدیں» بٹن دبائیں۔',
    shot: 'bazaar/03-product.png',
    caption: 'تعداد منتخب کر کے خریدیں',
  },
  {
    n: 4,
    title: 'ٹوکری دیکھیں',
    body: 'آپ کی چیزیں «ٹوکری» میں جمع ہوتی رہیں گی اور نیچے «کل رقم» لکھی آئے گی۔ اسی دکان سے مزید چیزیں لینی ہوں تو «اسی دکان سے مزید خریدیں» پر کلک کریں۔',
    shot: 'bazaar/04-cart.png',
    caption: 'ٹوکری اور کل رقم',
  },
  {
    n: 5,
    title: 'اپنی تفصیلات لکھیں',
    body: 'نیچے «ترسیل کی تفصیلات» میں اپنا نام، فون نمبر اور مکمل پتہ لکھیں — محلہ اور نشانی سمیت، تاکہ سامان آسانی سے پہنچ جائے۔ تینوں خانے ضروری ہیں۔',
    shot: 'bazaar/05-checkout.png',
    caption: 'نام، فون نمبر اور پتہ',
  },
  {
    n: 6,
    title: 'آرڈر مکمل کریں',
    body: 'تینوں خانے بھرتے ہی «آرڈر مکمل کریں» کا بٹن نیلا ہو جائے گا۔ اسے دبائیں۔ آپ کو ایک آرڈر نمبر ملے گا — «نمبر کاپی کریں» سے اسے محفوظ کر لیں۔ دکاندار جلد آپ سے رابطہ کرے گا۔',
  },
  {
    n: 7,
    title: 'آرڈر ٹریک کریں',
    body: 'اپنا آرڈر دیکھنے کے لیے بازار کی سکرین پر اوپر دائیں طرف رسید کے نشان پر کلک کریں۔ وہاں اپنا آرڈر نمبر اور وہی فون نمبر لکھیں جو آرڈر کرتے وقت دیا تھا، پھر «آرڈر تلاش کریں» دبائیں۔',
  },
];

const TIPS = [
  'ایک وقت میں صرف ایک دکان سے آرڈر ہو سکتا ہے۔ دوسری دکان سے کچھ ڈالیں گے تو ایپ پوچھے گی «ٹوکری خالی کریں؟» — «خالی کر کے شامل کریں» دبانے پر پرانی چیزیں نکل جائیں گی۔',
  'ادائیگی ڈیلیوری کے وقت نقد ہوتی ہے (Cash on Delivery)۔ ایپ میں کوئی آن لائن ادائیگی نہیں۔',
  'آرڈر نمبر اور اپنا فون نمبر محفوظ رکھیں — آرڈر ٹریک کرنے کے لیے دونوں ضروری ہیں۔',
  'فون نمبر مکمل لکھیں، مثلاً 03001234567۔ اسی نمبر پر دکاندار رابطہ کرے گا۔',
  'آرڈر کرنے کے لیے کوئی اکاؤنٹ یا لاگ اِن ضروری نہیں۔',
];

/**
 * A screenshot slot.
 *
 * The image is removed rather than shown broken when the file is missing, so
 * the guide still reads correctly before every screenshot has been added.
 */
function Shot({ src, caption }) {
  return (
    <figure className="mt-3">
      <img
        src={`/guide/${src}`}
        alt={caption}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.parentElement.style.display = 'none';
        }}
        className="mx-auto w-full max-w-[300px] rounded-xl border border-gray-200 shadow-sm sm:max-w-[360px]"
      />
      <figcaption className="urdu mt-2 text-center text-base text-gray-500">{caption}</figcaption>
    </figure>
  );
}

export default function BazaarGuidePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title="نارنگ بازار گائیڈ — گھر بیٹھے آرڈر کیسے کریں"
        description="نارنگ منڈی ایپ سے مقامی دکانوں سے سامان منگوانے کا آسان طریقہ: دکان منتخب کریں، ٹوکری میں ڈالیں، اور ڈیلیوری پر نقد ادائیگی کریں۔"
      />

      <header className="urdu text-center">
        <h1 className="urdu-bold text-3xl text-ink sm:text-4xl">نارنگ بازار گائیڈ</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600 sm:text-xl">
          گھر بیٹھے مقامی دکانوں سے سامان منگوانے کا طریقہ — سات آسان قدموں میں۔
        </p>
      </header>

      <div className="urdu mt-6 rounded-xl bg-brand/5 p-5 text-lg leading-relaxed text-gray-700 sm:p-6 sm:text-xl">
        <p className="urdu-bold text-xl text-ink sm:text-2xl">کام کیسے چلتا ہے؟</p>
        <p className="mt-1">
          آپ ایپ پر دکان منتخب کرتے ہیں، چیزیں ٹوکری میں ڈالتے ہیں، اور اپنا پتہ لکھ کر آرڈر بھیج
          دیتے ہیں۔ دکاندار آپ سے رابطہ کرتا ہے اور سامان گھر پہنچا دیتا ہے۔ ادائیگی سامان ملنے پر
          نقد ہوتی ہے۔
        </p>
      </div>

      <ol className="mt-6 space-y-6">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="urdu flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
                {s.n}
              </span>
              <div>
                <h2 className="urdu-bold text-xl text-ink sm:text-2xl">{s.title}</h2>
                <p className="mt-2 text-lg leading-relaxed text-gray-700 sm:text-xl">{s.body}</p>
              </div>
            </div>
            {s.shot && <Shot src={s.shot} caption={s.caption} />}
          </li>
        ))}
      </ol>

      <section className="urdu mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h2 className="urdu-bold text-xl text-ink sm:text-2xl">ضروری باتیں</h2>
        <ul className="mt-3 space-y-3 text-lg leading-relaxed text-gray-700 sm:text-xl">
          {TIPS.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-brand">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-3">
        <a
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="urdu urdu-bold rounded-xl bg-brand py-4 text-center text-xl text-white"
        >
          ایپ ڈاؤن لوڈ کریں
        </a>
        <a
          href="/shops"
          className="urdu urdu-bold rounded-xl border border-gray-300 py-4 text-center text-xl text-ink"
        >
          نارنگ بازار دیکھیں
        </a>
      </section>

      <p className="urdu mt-8 text-center text-lg leading-relaxed text-gray-600 sm:text-xl">
        کوئی مشکل ہو تو واٹس ایپ پر ہمیں پیغام یا وائس نوٹ بھیج دیں۔
        <br />
        ہماری ٹیم آپ کی مدد کے لیے حاضر ہے۔
      </p>
    </div>
  );
}
