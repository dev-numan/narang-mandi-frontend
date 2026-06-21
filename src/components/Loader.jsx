export default function Loader({ label = 'لوڈ ہو رہا ہے...' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({ label = 'کوئی خبر دستیاب نہیں' }) {
  return (
    <div className="rounded-xl bg-white py-16 text-center text-gray-400 shadow-sm">{label}</div>
  );
}

// Shown when a data fetch fails (network/server error). `error` is the Error
// thrown by the axios interceptor, so `error.message` is already user-friendly.
export function ErrorState({ error, onRetry, label, retryLabel = 'Try again' }) {
  const message = label || error?.message || 'Something went wrong. Please try again.';
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm">
      <span className="text-3xl">⚠️</span>
      <p className="max-w-sm px-4 text-sm text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
