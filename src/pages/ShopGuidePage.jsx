import Seo from '../components/Seo.jsx';

/**
 * How to run an online shop, in Urdu, for shopkeepers.
 *
 * Public and unauthenticated on purpose: a shopkeeper reads this *before* their
 * first login, so it cannot sit behind the guard.
 *
 * Labels are copied verbatim from the Android app, which is where the
 * screenshots come from. The web panel is a different, fuller implementation
 * with its own Urdu strings — quoting those here would stop matching the app.
 */

const APP_URL = 'https://play.google.com/store/apps/details?id=com.narangmandi';

const STEPS = [
  {
    n: 1,
    title: 'ایپ ڈاؤن لوڈ کریں',
    body: 'پلے سٹور سے نارنگ منڈی ایپ انسٹال کریں۔ ایپ مفت ہے۔ نیچے والا بٹن دبائیں:',
    link: APP_URL,
    linkLabel: 'پلے سٹور سے ڈاؤن لوڈ کریں',
  },
  {
    n: 2,
    title: 'دکان ایڈمن کھولیں',
    body: 'ایپ کھولنے کے بعد نیچے کی پٹی میں «مزید» پر کلک کریں۔ فہرست میں سب سے اوپر «Shop Admin Panel» ہے — اس پر کلک کریں۔',
  },
  {
    n: 3,
    title: 'لاگ اِن کریں',
    body: 'ہم نے واٹس ایپ پر آپ کو ای میل اور پاس ورڈ بھیجا ہے۔ وہی «ای میل» اور «پاس ورڈ» کے خانوں میں لکھ کر «لاگ اِن» دبائیں۔',
  },
  {
    n: 4,
    title: 'پہلے کیٹیگریز بنائیں',
    body: 'لاگ اِن کے بعد «کیٹیگریز — Categories» پر جائیں اور «نئی کیٹیگری» سے اپنے سامان کی قسمیں بنائیں، جیسے بلب، تار، پنکھے۔ اس سے گاہک کو چیز ڈھونڈنے میں آسانی ہوتی ہے۔',
  },
  {
    n: 5,
    title: 'مصنوعات شامل کریں',
    body: '«مصنوعات — Products» پر جائیں اور «نیا» کے بٹن سے چیز شامل کریں۔ نام، تفصیل، قیمت اور کیٹیگری لکھیں، تصویر لگائیں، اور «محفوظ کریں» دبا دیں۔',
  },
  {
    n: 6,
    title: 'چیز دکھائیں یا چھپائیں',
    body: 'ہر چیز کے ساتھ «فعال» کا بٹن ہوتا ہے۔ یہ آن ہو تو چیز گاہکوں کو نظر آتی ہے۔ کوئی چیز ختم ہو جائے تو اسے حذف کرنے کے بجائے «فعال» بند کر دیں — بعد میں دوبارہ آن کر سکتے ہیں۔',
  },
  {
    n: 7,
    title: 'آرڈر دیکھیں',
    body: '«آرڈرز — Orders» میں تمام آرڈر آتے ہیں۔ ہر آرڈر پر نمبر، گاہک کا نام اور کل رقم لکھی ہوتی ہے۔ کسی آرڈر پر کلک کریں تو گاہک کا فون نمبر، پتہ اور منگوائی گئی اشیاء نظر آتی ہیں۔',
  },
  {
    n: 8,
    title: 'آرڈر کی حالت بدلیں',
    body: 'آرڈر کی تفصیل میں نیچے «اسٹیٹس بدلیں» لکھا ہوتا ہے اور چار بٹن ہوتے ہیں۔ یہ انگریزی میں لکھے ہیں — نیچے ان کا مطلب دیا گیا ہے۔',
    statuses: true,
  },
];

/// The app renders these as raw English keys (ShopAdminOrders.kt), so the guide
/// translates them rather than pretending they appear in Urdu.
const STATUSES = [
  { en: 'pending', ur: 'نیا آرڈر — ابھی آپ نے دیکھا نہیں' },
  { en: 'processing', ur: 'آپ نے دیکھ لیا اور سامان تیار کر رہے ہیں' },
  { en: 'fulfilled', ur: 'سامان گاہک کو پہنچا دیا — آرڈر مکمل' },
  { en: 'cancelled', ur: 'آرڈر منسوخ ہو گیا' },
];

const TIPS = [
  'نیا آرڈر آنے پر آپ کو واٹس ایپ پر اطلاع ملے گی۔ ایپ کی نوٹیفیکیشن بھی آن رکھیں۔',
  'آرڈر ملتے ہی گاہک کو فون کر کے تصدیق کر لیں — اس سے آرڈر منسوخ ہونے کے امکانات کم ہو جاتے ہیں۔',
  'ادائیگی ڈیلیوری کے وقت نقد ہوتی ہے۔ سامان پہنچانے پر رقم وصول کریں۔',
  'صاف تصویر اور درست قیمت والی چیزیں زیادہ بکتی ہیں۔ قیمت بدلے تو ایپ میں بھی بدل دیں۔',
  'سامان دینے کے بعد اسٹیٹس «fulfilled» کر دیں تاکہ آپ کا حساب درست رہے۔',
  'پاس ورڈ بدلنا ہو تو «پروفائل — Profile» میں «پاس ورڈ تبدیل» کا خانہ موجود ہے۔',
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

export default function ShopGuidePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title="دکاندار گائیڈ — آن لائن دکان کیسے چلائیں"
        description="نارنگ منڈی ایپ پر اپنی دکان چلانے کا آسان طریقہ: لاگ اِن، کیٹیگریز اور مصنوعات شامل کرنا، اور آرڈر سنبھالنا۔"
      />

      <header className="urdu text-center">
        <h1 className="urdu-bold text-3xl text-ink sm:text-4xl">دکاندار گائیڈ</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600 sm:text-xl">
          اپنی آن لائن دکان چلانے کا طریقہ — آٹھ آسان قدموں میں۔
        </p>
      </header>

      <div className="urdu mt-6 rounded-xl bg-brand/5 p-5 text-lg leading-relaxed text-gray-700 sm:p-6 sm:text-xl">
        <p className="urdu-bold text-xl text-ink sm:text-2xl">کام کیسے چلتا ہے؟</p>
        <p className="mt-1">
          آپ اپنی دکان کا سامان ایپ پر لگاتے ہیں۔ گاہک گھر بیٹھے آرڈر کرتا ہے اور آپ کو اطلاع مل
          جاتی ہے۔ آپ سامان تیار کر کے پہنچاتے ہیں اور رقم ڈیلیوری کے وقت نقد وصول کرتے ہیں۔
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
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="urdu urdu-bold mt-3 inline-block rounded-xl bg-brand px-5 py-2.5 text-base text-white"
                  >
                    {s.linkLabel}
                  </a>
                )}
                {s.statuses && (
                  <dl className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                    {STATUSES.map((st) => (
                      <div key={st.en} className="flex flex-wrap items-baseline gap-2">
                        {/* dir="ltr": these are Latin words inside RTL text and
                            otherwise reorder around the surrounding Urdu. */}
                        <dt
                          dir="ltr"
                          className="shrink-0 rounded bg-white px-2 py-0.5 text-sm font-semibold text-ink"
                        >
                          {st.en}
                        </dt>
                        <dd className="urdu text-base text-gray-700 sm:text-lg">{st.ur}</dd>
                      </div>
                    ))}
                  </dl>
                )}
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
          href="/shop/admin/login"
          className="urdu urdu-bold rounded-xl border border-gray-300 py-4 text-center text-xl text-ink"
        >
          دکاندار لاگ اِن
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
