import Seo from '../components/Seo.jsx';

/**
 * How to use the driver panel, in Urdu, for drivers being onboarded over
 * WhatsApp.
 *
 * Public and unauthenticated on purpose: it is linked from the welcome message
 * a driver reads *before* their first login, so it cannot sit behind the guard.
 *
 * Button labels below are copied verbatim from the driver panel — a guide that
 * paraphrases them stops matching the screen the driver is looking at.
 */

const APP_URL =
  'https://play.google.com/store/apps/details?id=com.narangmandi&pcampaignid=web_share';

const STEPS = [
  {
    n: 1,
    title: 'ایپ ڈاؤن لوڈ کریں',
    body: 'پلے سٹور سے نارنگ منڈی ایپ انسٹال کریں۔ ایپ مفت ہے۔ نیچے والا بٹن دبائیں:',
    link: APP_URL,
    linkLabel: 'پلے سٹور سے ڈاؤن لوڈ کریں',
    shot: '01-app.png',
    caption: 'پلے سٹور پر نارنگ منڈی ایپ',
  },
  {
    n: 2,
    title: 'ڈرائیور پینل کھولیں',
    body: 'ایپ کھولنے کے بعد نیچے کی پٹی میں «مزید» پر کلک کریں۔ فہرست کھلے گی — اس میں دوسرے نمبر پر «Driver Panel» ہے، اس کے ساتھ ٹیکسی کا نشان بنا ہوتا ہے۔ اس پر کلک کریں۔',
    shot: '02-more-menu.png',
    caption: '«مزید» کی فہرست میں Driver Panel',
  },
  {
    n: 3,
    title: 'لاگ اِن کریں',
    body: 'ہم نے واٹس ایپ پر آپ کو ای میل اور پاس ورڈ بھیجا ہے۔ وہی یہاں لکھیں اور «لاگ اِن» دبائیں۔ پاس ورڈ دیکھنے کے لیے آنکھ کے نشان پر کلک کریں۔',
    sample: { email: 'naam@narangdriver.com', password: 'naam2468' },
    shot: '03-login.jpg',
    caption: 'ڈرائیور پینل — لاگ اِن',
  },
  {
    n: 4,
    title: 'نئی سواریاں دیکھیں',
    body: 'لاگ اِن کے بعد «سواریاں» والا خانہ کھلتا ہے۔ ہر کارڈ پر وقت لکھا ہوتا ہے، پھر «سے» (کہاں سے) اور «تک» (کہاں تک)۔ نیچے یہ بھی نظر آتا ہے کہ اب تک کتنی پیشکشیں آ چکی ہیں۔',
    shot: '04-open-rides.jpg',
    caption: 'سواریوں کا بورڈ',
  },
  {
    n: 5,
    title: 'سواری پر کلک کریں',
    body: 'جو سواری آپ کو مناسب لگے، اس پر کلک کریں۔ اندر «کرایہ» کا خانہ کھلے گا۔ آپ چاہیں تو −100، −50، +50، +100 والے بٹنوں سے کرایہ کم یا زیادہ کر سکتے ہیں۔',
    shot: '05-send-fare.jpg',
    caption: 'کرایے کا خانہ',
  },
  {
    n: 6,
    title: 'کرایہ اور وقت بھیجیں',
    body: 'کرایہ لکھیں، پھر «کتنی دیر میں پہنچیں گے؟» میں سے 5، 10، 15 یا 20 منٹ چنیں۔ آخر میں «پیشکش بھیجیں» کا نیلا بٹن دبا دیں۔',
    shot: '06-send-fare-filled.jpg',
    caption: 'کرایہ لکھ کر پیشکش بھیجیں',
  },
  {
    n: 7,
    title: 'کرایہ بدلنا',
    body: 'پیشکش بھیجنے کے بعد اوپر سبز رنگ میں «آپ کی پیشکش» لکھا آ جائے گا۔ ارادہ بدل جائے تو نیا کرایہ لکھ کر «قیمت بدلیں» دبا دیں۔',
    shot: '07-change-fare.jpg',
    caption: 'آپ کی پیشکش — قیمت بدلیں',
  },
  {
    n: 8,
    title: 'گاہک آپ کو منتخب کرے گا',
    body: 'گاہک تمام کرایے دیکھ کر خود ڈرائیور چنتا ہے۔ آپ کا کرایہ منظور ہوتے ہی سواری «فعال» والے خانے میں آ جائے گی اور اوپر سبز گاڑی کے نشان پر گنتی نظر آنے لگے گی۔',
    shot: '08-my-rides.jpg',
    caption: '«فعال» سواری',
  },
  {
    n: 9,
    title: 'گاہک کو کال کریں',
    body: 'سواری پر کلک کریں تو گاہک کا نام اور نمبر نظر آئے گا۔ سبز «کال» کے بٹن سے سیدھا کال کریں اور سواری لینے پہنچ جائیں۔',
    shot: '09-customer.jpg',
    caption: 'گاہک کا نام، نمبر اور کال کا بٹن',
  },
  {
    n: 10,
    title: 'سفر مکمل کریں',
    body: 'سواری پہنچانے کے بعد «سفر مکمل ہوا» دبائیں۔ تصدیق کے لیے «مکمل کریں» پر کلک کریں۔',
    shot: '10-complete.jpg',
    caption: 'تصدیق — مکمل کریں',
  },
  {
    n: 11,
    title: 'مکمل سواریاں',
    body: 'ہر مکمل سواری «مکمل» والے خانے میں محفوظ ہو جاتی ہے، تاکہ آپ کو اپنا سارا حساب نظر آتا رہے۔',
    shot: '11-done.jpg',
    caption: '«مکمل» سواریاں',
  },
];

const TIPS = [
  'نوٹیفیکیشن آن رکھیں — نئی سواری کی اطلاع فوراً ملے گی۔ اطلاع نہ ملے تو نئی سواری کسی اور کو مل جائے گی۔',
  'دوسرے ڈرائیوروں کا کرایہ آپ کو نظر نہیں آتا، اور نہ آپ کا انہیں۔ اس لیے کرایہ مناسب رکھیں۔',
  'کرایہ صرف انگریزی ہندسوں میں لکھیں، جیسے 500۔',
  'جو کرایہ آپ بھیجیں گے، منظوری کے بعد وہی لینا ہوگا۔ اس لیے سوچ کر بھیجیں۔',
  'سواری منسوخ ہو جائے تو آپ کو اطلاع مل جائے گی۔',
];

/**
 * A screenshot slot.
 *
 * The image is removed rather than shown broken when the file is missing, so
 * the guide still reads correctly before the screenshots have been added.
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

export default function DriverGuidePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title="ڈرائیور گائیڈ — نارنگ منڈی ٹیکسی"
        description="نارنگ منڈی ٹیکسی ایپ استعمال کرنے کا آسان طریقہ: لاگ اِن، کرایہ بھیجنا، اور سواری مکمل کرنا۔"
      />

      <header className="urdu text-center">
        <h1 className="urdu-bold text-3xl text-ink sm:text-4xl">ڈرائیور گائیڈ</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600 sm:text-xl">
          نارنگ منڈی ٹیکسی میں سواری لینے کا طریقہ — گیارہ آسان قدموں میں۔
        </p>
      </header>

      <div className="urdu mt-6 rounded-xl bg-brand/5 p-5 text-lg leading-relaxed text-gray-700 sm:p-6 sm:text-xl">
        <p className="urdu-bold text-xl text-ink sm:text-2xl">کام کیسے چلتا ہے؟</p>
        <p className="mt-1">
          گاہک ایپ پر سواری لکھتا ہے۔ تمام ڈرائیوروں کو اطلاع جاتی ہے۔ ہر ڈرائیور اپنا کرایہ بھیجتا
          ہے۔ گاہک جس کا کرایہ پسند کرے، سواری اسی کو مل جاتی ہے۔
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
                {s.sample && (
                  <dl className="mt-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-baseline gap-2">
                      <dt className="urdu shrink-0 text-sm text-gray-500">ای میل:</dt>
                      {/* dir="ltr" per element: Latin credentials inside RTL
                          text otherwise reorder around the dots and the @. */}
                      <dd dir="ltr" className="break-all text-sm font-semibold text-ink">
                        {s.sample.email}
                      </dd>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <dt className="urdu shrink-0 text-sm text-gray-500">پاس ورڈ:</dt>
                      <dd dir="ltr" className="text-sm font-semibold text-ink">
                        {s.sample.password}
                      </dd>
                    </div>
                  </dl>
                )}
                {s.note && (
                  <p className="urdu mt-2 text-base leading-relaxed text-gray-500">{s.note}</p>
                )}
                {s.link && (
                  // A button rather than the bare URL: the Play Store link is
                  // long enough to wrap across three lines on a phone, and a
                  // wrapped link is neither readable nor an easy tap target.
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="urdu urdu-bold mt-3 inline-block rounded-xl bg-brand px-5 py-2.5 text-base text-white"
                  >
                    {s.linkLabel}
                  </a>
                )}
              </div>
            </div>
            <Shot src={s.shot} caption={s.caption} />
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
          href="/driver/login"
          className="urdu urdu-bold rounded-xl border border-gray-300 py-4 text-center text-xl text-ink"
        >
          ڈرائیور لاگ اِن
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
