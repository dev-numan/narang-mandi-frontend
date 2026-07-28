import { FEATURES, featureSeoTitle } from '../constants/features.js';
import Seo from '../components/Seo.jsx';

/** Public shops listing is temporarily blocked — show coming soon only. */
export default function ShopsPage() {
  return (
    <>
      <Seo
        title={featureSeoTitle(FEATURES.shops)}
        socialTitle={FEATURES.shops.title}
        description={FEATURES.shops.description}
        path="/shops"
        noindex
      />

      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-5xl">
          {FEATURES.shops.icon}
        </div>
        <h1 className="urdu text-3xl font-bold text-ink sm:text-4xl">جلد آ رہا ہے</h1>
      </div>
    </>
  );
}
