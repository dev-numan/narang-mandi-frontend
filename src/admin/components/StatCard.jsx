export default function StatCard({
  label,
  value,
  icon,
  accent = 'bg-brand',
  labelClassName = '',
  valueClassName = '',
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl text-white ${accent}`}>
        {icon}
      </div>
      <div>
        <p className={`font-bold text-ink ${valueClassName || 'text-2xl'}`}>{value ?? '—'}</p>
        <p className={`text-gray-500 ${labelClassName || 'text-sm'}`}>{label}</p>
      </div>
    </div>
  );
}
