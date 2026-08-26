import Seo from '../components/Seo.jsx';

/**
 * How to book a ride, in Urdu, for customers.
 *
 * The driver side has its own page at /driver/guide; this one is deliberately
 * only the passenger half, and links across rather than covering both.
 *
 * Labels are copied verbatim from the Android app, which is where the
 * screenshots come from — the web site words several of these differently.
 */

const APP_URL = 'https://play.google.com/store/apps/details?id=com.narangmandi';

const STEPS = [
  {
    n: 1,
    title: 'ٹیکسی کھولیں',
    body: 'ایپ کے ہوم صفحے پر «Online Taxi» کے خانے پر کلک کریں۔ سواری منگوانے کا فارم کھل جائے گا۔',
    shot: 'taxi/01-form.png',
    caption: 'سواری منگوائیں',
  },
  {
    n: 2,
    title: 'سفر کی تفصیل لکھیں',
    body: '«کہاں سے؟» میں وہ جگہ لکھیں جہاں سے آپ کو سوار ہونا ہے، اور «کہاں تک؟» میں منزل۔ جگہ کا نام سادہ الفاظ میں لکھیں، جیسے «نارنگ منڈی ریلوے اسٹیشن» یا «مریدکے چوک»۔',
  },
  {
    n: 3,
    title: 'وقت منتخب کریں',
    body: '«کب؟» پر کلک کر کے وقت چنیں۔ اگر ابھی سواری چاہیے تو اسے «ابھی» ہی رہنے دیں — ڈرائیوروں کو یہی نظر آئے گا۔',
  },
  {
    n: 4,
    title: 'اپنا نام اور نمبر لکھیں',
    body: 'اپنا نام اور فون نمبر لکھیں۔ یہی نمبر ڈرائیور کو دیا جائے گا اور اسی سے آپ بعد میں اپنی سواری دوبارہ دیکھ سکیں گے۔ کوئی خاص بات ہو تو «کوئی بات؟» میں لکھ دیں۔',
  },
  {
    n: 5,
    title: 'ڈرائیوروں کو بھیجیں',
    body: 'نیچے «ڈرائیوروں کو بھیجیں» کا بٹن دبائیں۔ شہر کے تمام ڈرائیوروں کو آپ کی سواری کی اطلاع چلی جائے گی۔ آپ کو ایک کوڈ ملے گا — اسے محفوظ رکھیں۔',
  },
  {
    n: 6,
    title: 'کرایوں کا انتظار کریں',
    body: 'اوپر «پیشکشوں کا انتظار» لکھا آئے گا اور ساتھ گھڑی چلے گی۔ ڈرائیور اپنا اپنا کرایہ بھیجیں گے اور فہرست میں آتے جائیں گے — ہر ایک کے ساتھ اس کا نام، گاڑی اور کتنی دیر میں پہنچے گا، یہ سب لکھا ہوگا۔',
  },
  {
    n: 7,
    title: 'ڈرائیور منتخب کریں',
    body: 'جو کرایہ آپ کو مناسب لگے، اس کے سامنے «منتخب کریں» دبا دیں۔ باقی ڈرائیوروں کی پیشکشیں ختم ہو جائیں گی اور آپ کا سفر طے ہو جائے گا۔',
  },
  {
    n: 8,
    title: 'ڈرائیور سے رابطہ کریں',
    body: 'منتخب کرنے کے بعد ڈرائیور کا نام، گاڑی، طے شدہ کرایہ اور فون نمبر آپ کو نظر آئے گا۔ «کال» یا «واٹس ایپ» کے بٹن سے سیدھا رابطہ کریں۔',
  },
];

const TIPS = [
  'ڈرائیوروں کو جواب دینے کے لیے چار منٹ ملتے ہیں۔ اس دوران کوئی پیشکش نہ آئے تو ایپ آپ کو ڈرائیوروں کی فہرست دکھا دے گی تاکہ آپ خود رابطہ کر سکیں۔',
  'کوڈ اور اپنا فون نمبر محفوظ رکھیں۔ ایپ بند بھی ہو جائے تو «پہلے سے درخواست بھیج چکے ہیں؟» میں یہ دونوں لکھ کر «دیکھیں» دبائیں — آپ کی سواری واپس کھل جائے گی۔',
  'کرایہ ڈرائیور اور آپ کے درمیان طے ہوتا ہے۔ ایپ کوئی کرایہ مقرر نہیں کرتی اور نہ ہی کوئی کمیشن لیتی ہے۔',
  'سواری کی ضرورت نہ رہے تو «درخواست منسوخ کریں» دبا دیں تاکہ ڈرائیور انتظار نہ کریں۔',
  'سواری منگوانے کے لیے کوئی اکاؤنٹ یا لاگ اِن ضروری نہیں۔',
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

export default function TaxiGuidePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title="ٹیکسی گائیڈ — آن لائن سواری کیسے منگوائیں"
        description="نارنگ منڈی ایپ سے ٹیکسی بک کرنے کا آسان طریقہ: سواری کی درخواست بھیجیں، ڈرائیوروں کے کرائے دیکھیں، اور اپنی پسند کا ڈرائیور منتخب کریں۔"
      />

      <header className="urdu text-center">
        <h1 className="urdu-bold text-3xl text-ink sm:text-4xl">ٹیکسی گائیڈ</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600 sm:text-xl">
          آن لائن سواری منگوانے کا طریقہ — آٹھ آسان قدموں میں۔
        </p>
      </header>

      <div className="urdu mt-6 rounded-xl bg-brand/5 p-5 text-lg leading-relaxed text-gray-700 sm:p-6 sm:text-xl">
        <p className="urdu-bold text-xl text-ink sm:text-2xl">کام کیسے چلتا ہے؟</p>
        <p className="mt-1">
          آپ ایپ پر لکھتے ہیں کہ کہاں سے کہاں جانا ہے۔ شہر کے تمام ڈرائیوروں کو اطلاع جاتی ہے اور
          ہر ڈرائیور اپنا کرایہ بھیجتا ہے۔ جو کرایہ آپ کو پسند آئے، وہ ڈرائیور آپ خود منتخب کرتے
          ہیں۔
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
          href="/taxi"
          className="urdu urdu-bold rounded-xl border border-gray-300 py-4 text-center text-xl text-ink"
        >
          سواری منگوائیں
        </a>
      </section>

      <p className="urdu mt-8 text-center text-lg leading-relaxed text-gray-600 sm:text-xl">
        ڈرائیور ہیں اور سواریاں لینا چاہتے ہیں؟{' '}
        <a href="/driver/guide" className="text-brand underline">
          ڈرائیور گائیڈ دیکھیں
        </a>
      </p>
    </div>
  );
}
