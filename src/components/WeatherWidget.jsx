import { useQuery } from '@tanstack/react-query';

// Narang Mandi, Punjab, Pakistan
const LAT = 31.90376;
const LON = 74.51587;

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
  '&timezone=Asia/Karachi';

// Always show a static cloud icon, regardless of the actual weather condition.
const CLOUD_ICON = '☁️';

function useWeather() {
  return useQuery({
    queryKey: ['weather', LAT, LON],
    queryFn: async () => {
      const res = await fetch(WEATHER_URL);
      if (!res.ok) throw new Error('weather fetch failed');
      const json = await res.json();
      return json.current;
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // refresh every 10 minutes
    retry: 1,
  });
}

export default function WeatherWidget({ variant = 'card' }) {
  const { data, isLoading, isError } = useWeather();

  if (isError) return null;

  const icon = CLOUD_ICON;
  const temp = data ? Math.round(data.temperature_2m) : null;

  // Compact inline chip (used in the header)
  if (variant === 'compact') {
    if (isLoading || temp === null) return null;
    return (
      <span
        className="hidden items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-ink sm:inline-flex"
        title="نارنگ منڈی"
      >
        <span className="text-base leading-none">{icon}</span>
        <span className="font-semibold">{temp}°</span>
      </span>
    );
  }

  // Full sidebar card
  return (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 p-4 text-white shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold">نارنگ منڈی کا موسم</h3>
        <span className="text-xs text-sky-100">براہِ راست</span>
      </div>

      {isLoading || !data ? (
        <p className="py-4 text-center text-sky-100">موسم لوڈ ہو رہا ہے…</p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-5xl leading-none">{icon}</span>
            <div>
              <div className="text-4xl font-bold">{temp}°<span className="text-2xl">C</span></div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-3 text-center text-xs">
            <div>
              <div className="text-sky-100">محسوس</div>
              <div className="font-semibold">{Math.round(data.apparent_temperature)}°</div>
            </div>
            <div>
              <div className="text-sky-100">نمی</div>
              <div className="font-semibold">{data.relative_humidity_2m}%</div>
            </div>
            <div>
              <div className="text-sky-100">ہوا</div>
              <div className="font-semibold">{Math.round(data.wind_speed_10m)} کلومیٹر</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
