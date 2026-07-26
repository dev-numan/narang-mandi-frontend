import { Link } from 'react-router-dom';
import { REGISTRATION_TYPES } from '../constants/registration.js';

function Banner({ kind, variant = 'horizontal' }) {
  const b = REGISTRATION_TYPES[kind];
  const isRail = variant === 'rail';
  const overlay = isRail
    ? kind === 'driver'
      ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(69,10,10,0.55) 45%, rgba(17,24,39,0.85) 100%)'
      : 'linear-gradient(180deg, rgba(127,29,29,0.3) 0%, rgba(185,28,28,0.45) 40%, rgba(69,10,10,0.88) 100%)'
    : kind === 'driver'
      ? 'linear-gradient(90deg, rgba(17,24,39,0.25) 0%, rgba(69,10,10,0.35) 45%, rgba(0,0,0,0.55) 100%)'
      : 'linear-gradient(90deg, rgba(127,29,29,0.25) 0%, rgba(185,28,28,0.35) 45%, rgba(69,10,10,0.55) 100%)';

  if (isRail) {
    return (
      <Link
        to={b.path}
        className={`group relative flex min-h-[28rem] w-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b ${b.gradient} p-3 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl xl:sticky xl:top-24 xl:min-h-[calc(100vh-8rem)]`}
        style={
          b.bgImage
            ? {
                backgroundImage: `${overlay}, url(${b.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: b.bgPosition || 'center',
              }
            : undefined
        }
      >
        <div className="relative flex flex-1 flex-col">
          <div className="mb-3">
            <span className="urdu typo-banner-badge font-extrabold text-yellow-300 drop-shadow-sm">
              {b.badge}
            </span>
          </div>

          <h3 className="urdu typo-banner-title font-extrabold leading-snug drop-shadow-md">
            {b.title}
          </h3>
          {b.highlight && (
            <p className="urdu typo-banner-highlight mt-2 font-extrabold leading-tight text-yellow-300 drop-shadow-md">
              {b.highlight}
            </p>
          )}
          <p className="urdu typo-banner-subtitle mt-2 line-clamp-4 leading-relaxed text-white/90">
            {b.subtitle}
          </p>

          {b.perks?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {b.perks.slice(0, 3).map((p) => (
                <li key={p} className="urdu typo-banner-perk flex items-start gap-1 leading-snug text-white/90">
                  <span className="mt-0.5 text-yellow-300">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}

          <span className="urdu typo-banner-cta mt-auto inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-3 py-2.5 text-center font-bold text-brand-dark shadow-md transition group-hover:bg-yellow-300">
            {b.cta} ←
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-l ${b.gradient} p-5 text-white shadow-sm sm:p-6`}
      style={
        b.bgImage
          ? {
              backgroundImage: `${overlay}, url(${b.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: b.bgPosition || 'center',
            }
          : undefined
      }
    >
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <span className="urdu typo-banner-badge mb-2 inline-block font-extrabold tracking-wide text-yellow-300 drop-shadow-sm">
              {b.badge}
            </span>
            <h3 className="urdu typo-banner-title font-extrabold leading-tight drop-shadow-md">
              {b.title}
            </h3>
            {b.highlight && (
              <p className="urdu typo-banner-highlight mt-2 font-extrabold leading-tight text-yellow-300 drop-shadow-md">
                {b.highlight}
              </p>
            )}
            <p className="urdu typo-banner-subtitle mt-1 text-white/85">{b.subtitle}</p>
            {b.perks?.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {b.perks.map((p) => (
                  <li key={p} className="urdu typo-banner-perk flex items-center gap-1 text-white/90">
                    <span className="text-yellow-300">✓</span> {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        <Link
          to={b.path}
          className="urdu typo-banner-cta w-full shrink-0 rounded-xl bg-yellow-400 px-6 py-3 text-center font-bold text-brand-dark shadow-md transition hover:bg-yellow-300 sm:w-auto"
        >
          {b.cta} ←
        </Link>
      </div>
    </div>
  );
}

/** Mobile / tablet: two tall cards side by side (or stacked on very small screens). */
export function RegistrationBannersMobile() {
  return (
    <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:hidden">
      <Banner kind="shop" variant="rail" />
      <Banner kind="driver" variant="rail" />
    </section>
  );
}

/** Desktop side rails — pass kind="shop" | "driver". */
export function RegistrationRail({ kind }) {
  return <Banner kind={kind} variant="rail" />;
}

export default function RegistrationBanners() {
  return (
    <section className="mb-10 space-y-4">
      <Banner kind="shop" />
      <Banner kind="driver" />
    </section>
  );
}
