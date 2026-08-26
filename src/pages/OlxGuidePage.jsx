import Seo from '../components/Seo.jsx';

/**
 * How to buy and sell on Narang OLX, in Urdu.
 *
 * Covers both directions on one page: the two flows share a screen and most
 * people arrive wanting one and later need the other.
 *
 * Labels are copied verbatim from the Android app, which is where the
 * screenshots come from — on the web, posting an ad is a modal rather than its
 * own screen and several labels read differently.
 */

const APP_URL = 'https://play.google.com/store/apps/details?id=com.narangmandi';

const SELL_STEPS = [
  {
    n: 1,
    title: 'خرید و فروخت کھولیں',
    body: 'ایپ کے ہوم صفحے پر «Narang OLX» کے خانے پر کلک کریں۔ اوپر «اشتہار دیں» کا بٹن موجود ہے۔',
  },
  {
    n: 2,
    title: 'چیز کی تفصیل لکھیں',
    body: 'عنوان، زمرہ اور فون نمبر — یہ تین خانے ضروری ہیں۔ قیمت، مقام، اپنا نام اور تفصیل لکھنا اختیاری ہے مگر ان سے چیز جلدی بکتی ہے۔',
  },
  {
    n: 3,
    title: 'تصاویر لگائیں',
    body: 'زیادہ سے زیادہ پانچ تصاویر لگا سکتے ہیں۔ صاف اور روشنی میں لی گئی تصویریں دیکھنے والوں کا اعتماد بڑھاتی ہیں۔',
  },
  {
    n: 4,
    title: 'قیمت طے کریں',
    body: 'قیمت روپوں میں لکھیں۔ اگر بات چیت کی گنجائش ہو تو «قیمت قابلِ گفتگو ہے» پر نشان لگا دیں — خریدار کو یہ نظر آئے گا۔',
  },
  {
    n: 5,
    title: 'اشتہار جمع کریں',
    body: 'نیچے «اشتہار جمع کریں» دبائیں۔ اشتہار سیدھا شائع نہیں ہوتا — پہلے ہماری ٹیم اسے دیکھتی ہے، پھر یہ سب کو نظر آنے لگتا ہے۔',
  },
  {
    n: 6,
    title: 'سیل کوڈ محفوظ کریں',
    body: 'جمع کرنے کے بعد آپ کو ایک «سیل کوڈ» ملے گا۔ اسے ضرور لکھ لیں یا کاپی کر لیں — یہ دوبارہ نہیں دکھایا جاتا، اور چیز بکنے پر اسی سے اشتہار بند ہوگا۔',
  },
];

const BUY_STEPS = [
  {
    n: 7,
    title: 'اشتہار تلاش کریں',
    body: 'خرید و فروخت کی سکرین پر اوپر تلاش کا خانہ ہے اور ساتھ زمروں کے بٹن۔ «تمام» سے سب اشتہارات نظر آتے ہیں۔',
  },
  {
    n: 8,
    title: 'بیچنے والے سے رابطہ کریں',
    body: 'کسی اشتہار پر کلک کریں تو پوری تفصیل، تصاویر اور رابطے کے بٹن کھل جائیں گے۔ «کال کریں» یا «واٹس ایپ» سے سیدھا بیچنے والے سے بات کریں۔ جو اشتہار بک چکا ہو، اس پر «فروخت ہو چکا» لکھا آتا ہے۔',
  },
  {
    n: 9,
    title: 'چیز بک جائے تو نشان لگائیں',
    body: 'آپ کی چیز بک جائے تو «فروخت شدہ نشان لگائیں» پر جائیں، اپنا سیل کوڈ اور وہی فون نمبر لکھیں جو اشتہار میں دیا تھا۔ اشتہار بند ہو جائے گا اور لوگ بےکار فون نہیں کریں گے۔',
  },
];

const TIPS = [
  'اشتہار ہماری ٹیم کی منظوری کے بعد شائع ہوتا ہے، اس لیے تھوڑا انتظار کریں۔',
  'سیل کوڈ صرف ایک بار دکھایا جاتا ہے۔ اسے محفوظ کر لیں — بغیر کوڈ کے اشتہار فروخت شدہ نہیں کیا جا سکتا۔',
  'فروخت شدہ نشان لگاتے وقت وہی فون نمبر لکھیں جو اشتہار میں دیا تھا، ورنہ تصدیق نہیں ہوگی۔',
  'اشتہار دینے یا خریدنے کے لیے کوئی اکاؤنٹ یا لاگ اِن ضروری نہیں۔',
  'سودا اور ادائیگی خریدار اور بیچنے والے کے درمیان طے ہوتی ہے۔ چیز دیکھ کر اور تسلی کر کے لین دین کریں۔',
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

function StepList({ steps }) {
  return (
    <ol className="mt-4 space-y-6">
      {steps.map((s) => (
        <li key={s.n} className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="urdu flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
              {s.n}
            </span>
            <div>
              <h3 className="urdu-bold text-xl text-ink sm:text-2xl">{s.title}</h3>
              <p className="mt-2 text-lg leading-relaxed text-gray-700 sm:text-xl">{s.body}</p>
            </div>
          </div>
          {s.shot && <Shot src={s.shot} caption={s.caption} />}
        </li>
      ))}
    </ol>
  );
}

export default function OlxGuidePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title="نارنگ OLX گائیڈ — چیزیں بیچنے اور خریدنے کا طریقہ"
        description="نارنگ منڈی ایپ پر اشتہار دینے، سیل کوڈ محفوظ کرنے، اور مقامی خرید و فروخت کا آسان طریقہ۔"
      />

      <header className="urdu text-center">
        <h1 className="urdu-bold text-3xl text-ink sm:text-4xl">نارنگ OLX گائیڈ</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600 sm:text-xl">
          نارنگ منڈی میں چیزیں بیچنے اور خریدنے کا آسان طریقہ۔
        </p>
      </header>

      <div className="urdu mt-6 rounded-xl bg-brand/5 p-5 text-lg leading-relaxed text-gray-700 sm:p-6 sm:text-xl">
        <p className="urdu-bold text-xl text-ink sm:text-2xl">کام کیسے چلتا ہے؟</p>
        <p className="mt-1">
          بیچنے والا ایپ پر اپنی چیز کا اشتہار دیتا ہے۔ منظوری کے بعد اشتہار سب کو نظر آنے لگتا
          ہے۔ خریدار سیدھا فون یا واٹس ایپ پر رابطہ کرتا ہے — درمیان میں کوئی نہیں۔
        </p>
      </div>

      <h2 className="urdu urdu-bold mt-8 text-2xl text-ink sm:text-3xl">چیز کیسے بیچیں؟</h2>
      <StepList steps={SELL_STEPS} />

      <h2 className="urdu urdu-bold mt-10 text-2xl text-ink sm:text-3xl">چیز کیسے خریدیں؟</h2>
      <StepList steps={BUY_STEPS} />

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
          href="/classifieds"
          className="urdu urdu-bold rounded-xl border border-gray-300 py-4 text-center text-xl text-ink"
        >
          اشتہارات دیکھیں
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
