export default function StatCard({ label, value, icon, accent = 'bg-brand' }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl text-white ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
