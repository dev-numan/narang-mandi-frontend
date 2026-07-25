import { Link } from 'react-router-dom';
import { REGISTRATION_TYPES } from '../constants/registration.js';

function Banner({ kind }) {
  const b = REGISTRATION_TYPES[kind];
  const overlay =
    kind === 'driver'
      ? 'linear-gradient(90deg, rgba(17,24,39,0.25) 0%, rgba(69,10,10,0.35) 45%, rgba(0,0,0,0.55) 100%)'
      : 'linear-gradient(90deg, rgba(127,29,29,0.25) 0%, rgba(185,28,28,0.35) 45%, rgba(69,10,10,0.55) 100%)';

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
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            {b.icon}
          </span>
          <div>
            <span className="urdu mb-1 inline-block rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-extrabold text-brand-dark">
              {b.badge}
            </span>
            <h3 className="urdu text-lg font-bold leading-snug sm:text-xl">{b.title}</h3>
            <p className="urdu mt-1 text-sm text-white/85">{b.subtitle}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {b.perks.map((p) => (
                <li key={p} className="urdu flex items-center gap-1 text-xs text-white/90">
                  <span className="text-yellow-300">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          to={b.path}
          className="urdu w-full shrink-0 rounded-xl bg-yellow-400 px-6 py-3 text-center font-bold text-brand-dark shadow-md transition hover:bg-yellow-300 sm:w-auto"
        >
          {b.cta} ←
        </Link>
      </div>
    </div>
  );
}

export default function RegistrationBanners() {
  return (
    <section className="mb-10 space-y-4">
      <Banner kind="shop" />
      <Banner kind="driver" />
    </section>
  );
}
